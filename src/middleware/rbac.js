const checkRole = (...roles) => (req, res, next) => {
  const userRole = req.user && req.user.role && req.user.role.name

  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" })
  }

  next()
}

module.exports = checkRole
