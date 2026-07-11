const express = require("express");
const LabTest = require("../models/LabTest");
const { protect, authorize } = require("../middleware/auth");
const { uploadReport } = require("../middleware/upload");

const router = express.Router();

// @route  POST /api/labtests
// @desc   Patient books a blood/lab test
router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { testName, testType, preferredDate, preferredTimeSlot, collectionType, address, price } = req.body;

    const labTest = await LabTest.create({
      patient: req.user._id,
      testName,
      testType,
      preferredDate,
      preferredTimeSlot,
      collectionType,
      address,
      price,
    });

    res.status(201).json(labTest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/labtests/mine
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const tests = await LabTest.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/labtests/:id/status
// @desc   Admin/lab updates test status
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Lab test not found" });
    test.status = req.body.status || test.status;
    await test.save();
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/labtests/:id/result
// @desc   Admin/lab uploads the result file once ready
router.put("/:id/result", protect, authorize("admin"), uploadReport.single("resultFile"), async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Lab test not found" });

    if (req.file) test.resultFileUrl = `/uploads/reports/${req.file.filename}`;
    test.status = "completed";
    await test.save();

    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
