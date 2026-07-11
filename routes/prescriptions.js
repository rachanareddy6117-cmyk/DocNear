const express = require("express");
const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/prescriptions
// @desc   Doctor writes a prescription for a patient
router.post("/", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(400).json({ message: "Doctor profile not found" });

    const { appointment, patient, diagnosis, medicines, advice } = req.body;

    const prescription = await Prescription.create({
      appointment,
      patient,
      doctor: doctorProfile._id,
      diagnosis,
      medicines,
      advice,
    });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/prescriptions/mine
// @desc   Patient views their own prescriptions
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/prescriptions/patient/:patientId
// @desc   Doctor views prescriptions they wrote for a specific patient
router.get("/patient/:patientId", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    const prescriptions = await Prescription.find({
      patient: req.params.patientId,
      doctor: doctorProfile._id,
    }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
