const app = require("./app")

const connectToDB = require("./config/db")
const Role = require("./models/Role")
const env = require("./config/env")

const seedRoles = async () => {
  const roles = ["MANAGER", "SUPPORT", "USER"]
  const existing = await Role.find({ name: { $in: roles } }).lean()
  const existingNames = new Set(existing.map((r) => r.name))
  const missing = roles.filter((r) => !existingNames.has(r))
  if (missing.length === 0) return
  await Role.insertMany(missing.map((name) => ({ name })))
  console.log(`Seeded missing roles: ${missing.join(", ")}`)
}

const bootServer = async () => {
  await connectToDB()
  await seedRoles()

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`)
  })
}

bootServer().catch((err) => {
  console.error("Failed to start server:", err.message)
  process.exit(1)
})
