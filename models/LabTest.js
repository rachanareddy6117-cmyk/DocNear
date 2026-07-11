const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testName: { type: String, required: true }, // e.g. "Complete Blood Count"
    testType: { type: String, enum: ["blood", "urine", "imaging", "other"], default: "blood" },
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: { type: String },
    collectionType: { type: String, enum: ["home", "lab"], default: "home" },
    address: { type: String },
    status: {
      type: String,
      enum: ["booked", "sample-collected", "processing", "completed", "cancelled"],
      default: "booked",
    },
    resultFileUrl: { type: String }, // uploaded once results are ready
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabTest", labTestSchema);
