const handleError = (err, req, res, next) => {
  const status = err.statusCode || 500
  const msg = err.message || "An unexpected server error occurred"

  if (status === 500) {
    console.error(err)
  }

  res.status(status).json({ message: msg })
}

module.exports = handleError
