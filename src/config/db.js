const mongoose = require("mongoose")
const env = require("./env")

const connectToDB = async () => {
  mongoose.set("strictQuery", true)
  await mongoose.connect(env.mongoUri)
  console.log("Connected to MongoDB")
}

module.exports = connectToDB
