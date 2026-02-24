const mongoose = require("mongoose")

const statusLogSchema = new mongoose.Schema(
  {
    ticket_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
   
    changed_at: { type: Date, default: Date.now },
     old_status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], required: true },
    new_status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], required: true },
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: false }
)

module.exports = mongoose.model("TicketStatusLog", statusLogSchema)
