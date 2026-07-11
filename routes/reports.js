const express = require("express");
const Report = require("../models/Report");
const { protect, authorize } = require("../middleware/auth");
const { uploadReport } = require("../middleware/upload");

const router = express.Router();

// @route  POST /api/reports
// @desc   Patient uploads a medical report, optionally shares directly with a doctor
router.post("/", protect, authorize("patient"), uploadReport.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "A file is required" });

    const { title, description, sharedWithDoctor } = req.body;

    const report = await Report.create({
      patient: req.user._id,
      title,
      description,
      sharedWithDoctor: sharedWithDoctor || undefined,
      fileUrl: `/uploads/reports/${req.file.filename}`,
      fileType: req.file.mimetype,
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/reports/mine
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/reports/shared
// @desc   Doctor views reports patients have shared with them
router.get("/shared", protect, authorize("doctor"), async (req, res) => {
  try {
    const Doctor = require("../models/Doctor");
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) return res.json([]);

    const reports = await Report.find({ sharedWithDoctor: doctorProfile._id })
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
