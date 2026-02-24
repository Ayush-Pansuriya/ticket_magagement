const env = require("../config/env")
const User = require("../models/User")
const wrap = require("../middleware/asyncHandler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const login = wrap(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  let userData = await User.findOne({ email }).populate("role")
  if (!userData) {
    return res.status(401).json({ message: "Invalid email or password" })
  }

  const match = await bcrypt.compare(password, userData.password)
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" })
  }

  const token = jwt.sign(
    { userId: userData._id, role: userData.role.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  )

  const userInfo = {
    id: userData._id,
    name: userData.name,
    email: userData.email,
    role: userData.role.name,
    created_at: userData.created_at
  }

  res.json({ token, user: userInfo })
})

module.exports = { login }
