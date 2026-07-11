const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const { protect } = require("../middleware/auth");

const router = express.Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// @route  POST /api/auth/register
// @desc   Register a patient or a doctor
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["patient", "doctor"]).withMessage("Role must be patient or doctor"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, phone, role, age, gender, city } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already registered" });

      const user = await User.create({ name, email, password, phone, role, age, gender, city });

      // If registering as a doctor, create a linked doctor profile
      if (role === "doctor") {
        const { specialization, qualifications, experienceYears, consultationFee, clinicName } = req.body;
        await Doctor.create({
          user: user._id,
          specialization: specialization || "General Physician",
          qualifications,
          experienceYears,
          consultationFee,
          clinicName,
          city,
        });
      }

      const token = signToken(user._id);
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// @route  POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user._id);
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// @route  GET /api/auth/me
// @desc   Get logged-in user's profile
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
