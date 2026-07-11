const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sharedWithDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    title: { type: String, required: true }, // e.g. "X-Ray Chest"
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String }, // pdf, jpg, png
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
