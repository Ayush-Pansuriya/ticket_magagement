const jwt = require("jsonwebtoken")
const User = require("../models/User")
const env = require("../config/env")


const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    let user = await User.findById(payload.userId).populate("role")

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

module.exports = verifyToken
