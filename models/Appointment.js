const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "10:00-10:30"
    mode: { type: String, enum: ["video", "in-person"], default: "video" },
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    videoRoom: { type: String }, // unique room name for the video call
    notes: { type: String }, // doctor's consultation notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
