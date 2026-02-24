const dotenv = require("dotenv")
dotenv.config()

const env = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret:    process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d"
}
if (!env.mongoUri) {
  throw new Error("MONGO_URI is missing — add it to your .env file")
}
if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing — add it to your .env file")
}
module.exports = env
