const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    diagnosis: { type: String },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String }, // e.g. "500mg"
        frequency: { type: String }, // e.g. "twice a day"
        duration: { type: String }, // e.g. "5 days"
      },
    ],
    advice: { type: String },
    fileUrl: { type: String }, // optional scanned/PDF prescription
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
