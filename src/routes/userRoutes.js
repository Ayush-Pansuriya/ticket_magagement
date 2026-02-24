const express = require("express")
const checkRole = require("../middleware/rbac")
const { registerUser, getUsers } = require("../controllers/userController")
const verifyToken = require("../middleware/auth")


const router = express.Router()

router.use(verifyToken)
router.use(checkRole("MANAGER"))

router.post("/", registerUser)
router.get("/", getUsers)

module.exports = router
