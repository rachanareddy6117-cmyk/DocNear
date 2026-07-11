const express = require("express");
const Order = require("../models/Order");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/orders
// @desc   Patient orders medication (optionally linked to a prescription)
router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { prescription, items, deliveryAddress } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      patient: req.user._id,
      prescription,
      items,
      totalAmount,
      deliveryAddress,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/orders/mine
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const orders = await Order.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/orders/:id/status
// @desc   Admin/pharmacy updates order status
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
