const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    items: [
      {
        medicineName: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },
    deliveryAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
