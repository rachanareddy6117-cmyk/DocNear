const express = require("express");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/video/:appointmentId
// @desc   Returns the video call room details for an appointment.
//         Uses the free Jitsi Meet public server (meet.jit.si) — no API key needed.
//         Swap JITSI_DOMAIN in .env for a self-hosted Jitsi instance in production.
router.get("/:appointmentId", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate("patient", "name")
      .populate({ path: "doctor", populate: { path: "user", select: "name" } });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (!appointment.videoRoom) return res.status(400).json({ message: "This appointment has no video room" });

    const domain = process.env.JITSI_DOMAIN || "meet.jit.si";

    res.json({
      domain,
      roomName: appointment.videoRoom,
      callUrl: `https://${domain}/${appointment.videoRoom}`,
      patientName: appointment.patient?.name,
      doctorName: appointment.doctor?.user?.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
