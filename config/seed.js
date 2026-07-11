const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const LabTest = require("../models/LabTest");
const Order = require("../models/Order");

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    await LabTest.deleteMany();
    await Order.deleteMany();

    console.log("Database cleared.");

    // Create a Patient
    const patientUser = await User.create({
      name: "Rachana Reddy",
      email: "patient@sehatsathi.com",
      password: "password123",
      phone: "+91 98765 43210",
      role: "patient",
      age: 28,
      gender: "female",
      city: "Hyderabad",
      location: { lat: 17.3850, lng: 78.4867 },
      bloodGroup: "O+",
    });

    console.log("Patient seeded: patient@sehatsathi.com / password123");

    // Create an Admin
    const adminUser = await User.create({
      name: "Admin Sehat Sathi",
      email: "admin@sehatsathi.com",
      password: "password123",
      phone: "+91 99999 88888",
      role: "admin",
      city: "Hyderabad",
    });

    console.log("Admin seeded: admin@sehatsathi.com / password123");

    // Create Doctor Users and profiles
    const doc1User = await User.create({
      name: "Dr. Sandeep Kumar",
      email: "sandeep@sehatsathi.com",
      password: "password123",
      phone: "+91 88888 77777",
      role: "doctor",
      city: "Hyderabad",
    });

    const doc1Profile = await Doctor.create({
      user: doc1User._id,
      specialization: "General Physician",
      qualifications: "MBBS, MD (Internal Medicine)",
      experienceYears: 12,
      consultationFee: 500,
      clinicName: "Apollo Clinics",
      city: "Hyderabad",
      location: { lat: 17.3900, lng: 78.4900 },
      rating: 4.8,
      availability: {
        days: ["Monday", "Wednesday", "Friday"],
        slots: ["10:00 AM - 12:00 PM", "04:00 PM - 06:00 PM"],
      },
    });

    const doc2User = await User.create({
      name: "Dr. Priya Sharma",
      email: "priya@sehatsathi.com",
      password: "password123",
      phone: "+91 77777 66666",
      role: "doctor",
      city: "Hyderabad",
    });

    const doc2Profile = await Doctor.create({
      user: doc2User._id,
      specialization: "Dermatologist",
      qualifications: "MBBS, DDVL (Skin & VD)",
      experienceYears: 8,
      consultationFee: 600,
      clinicName: "Skin & Hair Care Clinic",
      city: "Hyderabad",
      location: { lat: 17.3800, lng: 78.4800 },
      rating: 4.6,
      availability: {
        days: ["Tuesday", "Thursday", "Saturday"],
        slots: ["11:00 AM - 01:00 PM", "05:00 PM - 07:00 PM"],
      },
    });

    const doc3User = await User.create({
      name: "Dr. Rajesh Patel",
      email: "rajesh@sehatsathi.com",
      password: "password123",
      phone: "+91 66666 55555",
      role: "doctor",
      city: "Hyderabad",
    });

    const doc3Profile = await Doctor.create({
      user: doc3User._id,
      specialization: "Cardiologist",
      qualifications: "MBBS, MD, DM (Cardiology)",
      experienceYears: 15,
      consultationFee: 1000,
      clinicName: "Care Heart Institute",
      city: "Hyderabad",
      location: { lat: 17.4000, lng: 78.5000 },
      rating: 4.9,
      availability: {
        days: ["Monday", "Tuesday", "Thursday", "Friday"],
        slots: ["02:00 PM - 04:00 PM"],
      },
    });

    console.log("Doctors seeded.");

    // Seed a couple of appointments
    const appointment1 = await Appointment.create({
      patient: patientUser._id,
      doctor: doc1Profile._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      timeSlot: "10:00 AM - 12:00 PM",
      mode: "video",
      reason: "General health checkup and consultation for seasonal flu symptoms.",
      status: "confirmed",
      videoRoom: "telemed-session-sandeep-demo",
    });

    const appointment2 = await Appointment.create({
      patient: patientUser._id,
      doctor: doc2Profile._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      timeSlot: "05:00 PM - 07:00 PM",
      mode: "in-person",
      reason: "Consultation regarding mild skin rashes on hands.",
      status: "completed",
      notes: "Advised to avoid allergen exposure. Prescribed topical cream.",
    });

    console.log("Appointments seeded.");

    // Seed a prescription
    await Prescription.create({
      appointment: appointment2._id,
      patient: patientUser._id,
      doctor: doc2Profile._id,
      diagnosis: "Contact Dermatitis",
      medicines: [
        { name: "Clobetasol Propionate Cream 0.05%", dosage: "Apply twice daily", duration: "7 days" },
        { name: "Cetirizine 10mg", dosage: "1 tablet at bedtime", duration: "7 days" },
      ],
      advice: "Keep the area dry. Avoid using perfumed soaps on hands. Follow up if symptoms persist.",
    });

    console.log("Prescription seeded.");

    // Seed a lab test
    await LabTest.create({
      patient: patientUser._id,
      testName: "Complete Blood Count (CBC) with ESR",
      testType: "blood",
      preferredDate: new Date(),
      preferredTimeSlot: "08:00 AM - 10:00 AM",
      collectionType: "home",
      address: "Flat 402, Signature Residency, Hyderabad",
      price: 350,
      status: "booked",
    });

    console.log("Lab test seeded.");

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

// Expose running standalone
const runSeed = async () => {
  const connectDB = require("./db");
  const dotenv = require("dotenv");
  dotenv.config();
  
  await connectDB();
  await seedData();
  mongoose.connection.close();
};

if (require.main === module) {
  runSeed();
}

module.exports = seedData;
