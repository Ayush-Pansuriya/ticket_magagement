const Ticket = require("../models/Ticket")
const TicketStatusLog = require("../models/TicketStatusLog")
const wrap = require("../middleware/asyncHandler")
const User = require("../models/User")
const TicketComment = require("../models/TicketComment")
const STATUS_ORDER = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 }
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"]


const checkStatusStep = (current, next) => {
  if (STATUS_ORDER[next] !== STATUS_ORDER[current] + 1)
    return `Cannot transition from ${current} to ${next}. Expected: ${STATUSES[STATUS_ORDER[current] + 1]}`
  return null
}

const checkTicketFields = ({ title, description, priority }) => {
  if (!title || title.trim().length < 5) return "Title must be at least 5 characters long"
  if (!description || description.trim().length < 10) return "Description must be at least 10 characters long"
  if (priority && !PRIORITIES.includes(priority)) return `Priority must be one of: ${PRIORITIES.join(", ")}`
  return null
}

const ticketPopulate = [
  { path: "created_by", populate: { path: "role" } },
  { path: "assigned_to", populate: { path: "role" } }
]

const makeTicket = wrap(async (req, res) => {
  const err = checkTicketFields(req.body)
  if (err) {
    return res.status(400).json({ message: err })
  }

  const { title, description, priority } = req.body

  let t = await Ticket.create({
    title: title.trim(),
    description: description.trim(),
    priority: priority || "MEDIUM",
    created_by: req.user._id
  })

  const data = await Ticket.findById(t._id).populate(ticketPopulate)
  res.status(201).json(data)
})

const fetchTickets = wrap(async (req, res) => {
  const userRole = req.user.role.name
  let filter = {}

  if (userRole === "SUPPORT") {
    filter.assigned_to = req.user._id
  } else if (userRole === "USER") {
    filter.created_by = req.user._id
  }

  const tickets = await Ticket.find(filter).populate(ticketPopulate)
  res.json(tickets)
})
const checkStatus = (status) => {
  if (!STATUSES.includes(status)) return `Status must be one of: ${STATUSES.join(", ")}`
  return null
}
const changeStatus = wrap(async (req, res) => {
  const { status } = req.body
  const statusErr = checkStatus(status)
  if (statusErr) {
    return res.status(400).json({ message: statusErr })
  }
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" })
  }
  if (ticket.status === status) {
    return res.status(400).json({ message: `Ticket is already ${status}` })
  }
  const transErr = checkStatusStep(ticket.status, status)
  if (transErr) {
    return res.status(400).json({ message: transErr })
  }
  await TicketStatusLog.create({
    ticket_id: ticket._id,
    old_status: ticket.status,
    new_status: status,
    changed_by: req.user._id
  })

  ticket.status = status
  await ticket.save()

  const result = await Ticket.findById(ticket._id).populate(ticketPopulate)
  res.json(result)
})
const removeTicket = wrap(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" })
  }
  await TicketComment.deleteMany({ ticket_id: ticket._id })
  await TicketStatusLog.deleteMany({ ticket_id: ticket._id })
  await ticket.deleteOne()

  res.status(204).send()
})
const assignToUser = wrap(async (req, res) => {
  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ message: "userId is required" })
  }

  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" })
  }
  let assigneeUser = await User.findById(userId).populate("role")
  if (!assigneeUser) {
    return res.status(404).json({ message: "User not found" })
  }

  if (assigneeUser.role.name === "USER") {
    return res.status(400).json({ message: "Tickets can only be assigned to SUPPORT agents or MANAGERs" })
  }
  ticket.assigned_to = assigneeUser._id
  await ticket.save()
  const updated = await Ticket.findById(ticket._id).populate(ticketPopulate)
  res.json(updated)
})


module.exports = {
  makeTicket,
  fetchTickets,
  assignToUser,
  changeStatus,
  removeTicket
}
