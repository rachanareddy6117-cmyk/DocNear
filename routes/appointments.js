const express = require("express");
const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/appointments
// @desc   Patient books an appointment with a doctor
router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { doctor, date, timeSlot, mode, reason } = req.body;

    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) return res.status(404).json({ message: "Doctor not found" });

    const videoRoom = mode === "video" ? `telemed-${crypto.randomBytes(6).toString("hex")}` : undefined;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      timeSlot,
      mode,
      reason,
      videoRoom,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/appointments/mine
// @desc   Get appointments for the logged-in patient or doctor
router.get("/mine", protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === "patient") {
      query = Appointment.find({ patient: req.user._id });
    } else {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) return res.json([]);
      query = Appointment.find({ doctor: doctorProfile._id });
    }

    const appointments = await query
      .populate("patient", "name email phone")
      .populate({ path: "doctor", populate: { path: "user", select: "name email phone" } })
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/appointments/:id/status
// @desc   Doctor confirms, completes, or cancels an appointment
router.put("/:id/status", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status || appointment.status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/appointments/:id/cancel
// @desc   Patient cancels their own appointment
router.put("/:id/cancel", protect, authorize("patient"), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
