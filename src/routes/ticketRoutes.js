const express = require("express")

const checkRole = require("../middleware/rbac")
const { makeTicket, fetchTickets, assignToUser, changeStatus, removeTicket } = require("../controllers/ticketController")
const { postComment, getComments } = require("../controllers/commentController")
const verifyToken = require("../middleware/auth")

const router = express.Router()

router.use(verifyToken)

router.post("/", checkRole("USER", "MANAGER"), makeTicket)

router.patch("/:id/status", checkRole("SUPPORT", "MANAGER"), changeStatus)
router.get("/", checkRole("USER", "SUPPORT", "MANAGER"), fetchTickets)
router.patch("/:id/assign", checkRole("SUPPORT", "MANAGER"), assignToUser)
router.delete("/:id", checkRole("MANAGER"), removeTicket)
router.get("/:id/comments", getComments)
router.post("/:id/comments", postComment)


module.exports = router
