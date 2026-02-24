
const wrap = require("../middleware/asyncHandler")
const Ticket = require("../models/Ticket")
const TicketComment = require("../models/TicketComment")

const removeComment = wrap(async (req, res) => {
  let existing = await TicketComment.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: "Comment not found" })
  }
  const isMgr = req.user.role.name === "MANAGER"
  const isOwner = existing.user_id.toString() === req.user._id.toString()
  if (!isMgr && !isOwner) {
    return res.status(403).json({ message: "You can only delete your own comments" })
  }
  await existing.deleteOne()
  res.status(204).send()
})
const canAccessTicket = (ticket, user) => {
  const role = user.role.name
  if (role === "MANAGER") return true
  if (role === "SUPPORT") {
    return ticket.assigned_to && ticket.assigned_to.toString() === user._id.toString()
  }
  return ticket.created_by.toString() === user._id.toString()
}
const postComment = wrap(async (req, res) => {
  const { comment } = req.body
  if (!comment || !comment.trim()) {
    return res.status(400).json({ message: "Comment text is required" })
  }
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" })
  }
  if (!canAccessTicket(ticket, req.user)) {
    return res.status(403).json({ message: "You do not have access to this ticket" })
  }
  const newComment = await TicketComment.create({
    ticket_id: ticket._id,
    user_id: req.user._id,
    comment: comment.trim()
  })
  res.status(201).json(newComment)
})
const editComment = wrap(async (req, res) => {
  const { comment } = req.body

  if (!comment || !comment.trim()) {
    return res.status(400).json({ message: "Comment text is required" })
  }
  let existing = await TicketComment.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: "Comment not found" })
  }
  const isMgr = req.user.role.name === "MANAGER"
  const isOwner = existing.user_id.toString() === req.user._id.toString()

  if (!isMgr && !isOwner) {
    return res.status(403).json({ message: "You can only edit your own comments" })
  }
  existing.comment = comment.trim()
  await existing.save()

  res.json(existing)
})
const getComments = wrap(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" })
  }
  if (!canAccessTicket(ticket, req.user)) {
    return res.status(403).json({ message: "You do not have access to this ticket" })
  }
  const comments = await TicketComment.find({ ticket_id: ticket._id })
    .populate("user_id", "name email")
    .sort({ created_at: 1 })

  res.json(comments)
})

module.exports = {
  postComment,
  getComments,
  editComment,
  removeComment
}
