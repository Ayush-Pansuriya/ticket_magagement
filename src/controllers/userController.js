const bcrypt = require("bcryptjs")
const User = require("../models/User")
const wrap = require("../middleware/asyncHandler")
const Role = require("../models/Role")
const ROLES = ["MANAGER", "SUPPORT", "USER"]
const getUsers = wrap(async (req, res) => {
  const allUsers = await User.find().populate("role")
  const result = allUsers.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role.name,
    created_at: u.created_at
  }))

  res.json(result)
})
const registerUser = wrap(async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password, and role are all required" })
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${ROLES.join(", ")}` })
  }
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: "An account with that email already exists" })
  }
  let roleData = await Role.findOne({ name: role })
  if (!roleData) {
    return res.status(400).json({ message: "Role not found in database" })
  }
  const hashedPw = await bcrypt.hash(password, 10)
  const newUser = await User.create({
    name,
    email,
    password: hashedPw,
    role: roleData._id
  })
  res.status(201).json({
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: roleData.name,
    created_at: newUser.created_at
  })
})
module.exports = {
  registerUser,
  getUsers
}
