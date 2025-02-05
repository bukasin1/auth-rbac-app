const mongoose = require("mongoose");

const orderStatuses = ["Pending", "Dispatched", "In Transit", "Delivered"];

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerId: { type: String, required: true },
    status: {
      type: String,
      enum: orderStatuses,
      default: "Pending", // Default order status
    },
  },
  { timestamps: true }
);

module.exports = { Order: mongoose.model("Order", orderSchema), orderStatuses };
