const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true }, // e.g. Cardiologist, Dermatologist
    qualifications: { type: String },
    experienceYears: { type: Number, default: 0 },
    licenseNumber: { type: String },
    consultationFee: { type: Number, default: 0 },
    clinicName: { type: String },
    city: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    availability: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { days: ["Monday","Wednesday"], slots: ["10:00 AM - 12:00 PM"] }
    rating: { type: Number, default: 0 },
    bio: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Geo index for "nearest doctor" queries
doctorSchema.index({ "location.lat": 1, "location.lng": 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
