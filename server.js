const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect Database and auto-seed if empty
connectDB().then(async () => {
  try {
    const User = require("./models/User");
    const count = await User.countDocuments();
    if (count === 0) {
      console.log("Database is empty. Triggering automatic database seeding...");
      const seedData = require("./config/seed");
      await seedData();
    } else {
      console.log(`Database already has ${count} users. Skipping seeding.`);
    }
  } catch (err) {
    console.error("Auto-seeding check failed:", err.message);
  }
});

// Middlewares
const allowedOrigins = [
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "https://www.docnear.in",
  "https://docnear.in",
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true); // Allow all in dev; restrict in strict prod
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Static Folder for web app
app.use(express.static(path.join(__dirname, "public")));
// Static folder for uploaded reports/prescriptions
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/prescriptions", require("./routes/prescriptions"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/labtests", require("./routes/labtests"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/video", require("./routes/video"));

// Handle SPA route fallback for frontend pages
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({ message: "Internal server error occurred", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === "production";
  const url = isProduction ? "https://www.docnear.in" : `http://localhost:${PORT}`;
  console.log(`DocNear server running at: ${url}`);
});
