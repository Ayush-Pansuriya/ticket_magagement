const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["MANAGER", "SUPPORT", "USER"],
      required: true,
      unique: true
    }
  },
  { timestamps: false }
)

module.exports = mongoose.model("Role", roleSchema)
