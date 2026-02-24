const verifyToken = require("../middleware/auth")
const { editComment, removeComment } = require("../controllers/commentController")
const express = require("express")


const router = express.Router()

router.use(verifyToken)

router.patch("/:id", editComment)
router.delete("/:id", removeComment)
module.exports = router
