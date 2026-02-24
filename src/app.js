const express = require("express")
const cors = require("cors")
const userRoutes = require("./routes/userRoutes")
const ticketRoutes = require("./routes/ticketRoutes")
const commentRoutes = require("./routes/commentRoutes")
const morgan = require("morgan")

const authRoutes = require("./routes/authRoutes")

const handleError = require("./middleware/errorHandler")

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.get("/", (req, res) => {
  res.json({ message: "Support Ticket Management API" })
})

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/tickets", ticketRoutes)
app.use("/comments", commentRoutes)

app.use(handleError)

module.exports = app
