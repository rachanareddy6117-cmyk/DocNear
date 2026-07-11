const express = require("express");
const Doctor = require("../models/Doctor");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/doctors
// @desc   List all doctors, optional filters: ?specialization=&city=
router.get("/", async (req, res) => {
  try {
    const { specialization, city } = req.query;
    const filter = {};
    if (specialization) filter.specialization = new RegExp(specialization, "i");
    if (city) filter.city = new RegExp(city, "i");

    const doctors = await Doctor.find(filter).populate("user", "name email phone profileImage");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/doctors/nearest?lat=&lng=
// @desc   Find nearest doctors using simple distance calculation
router.get("/nearest", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng query params are required" });

    const doctors = await Doctor.find({ "location.lat": { $exists: true } }).populate(
      "user",
      "name email phone profileImage"
    );

    // Haversine distance in km
    const toRad = (v) => (v * Math.PI) / 180;
    const distanceKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const withDistance = doctors
      .map((d) => ({
        doctor: d,
        distanceKm: distanceKm(parseFloat(lat), parseFloat(lng), d.location.lat, d.location.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(withDistance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/doctors/:id
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email phone profileImage");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/doctors/:id
// @desc   Doctor updates their own profile (availability, fee, bio, location)
router.put("/:id", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    Object.assign(doctor, req.body);
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
