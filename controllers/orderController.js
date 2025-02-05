const { Order, orderStatuses } = require("../models/Order");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { email, id } = req.user;
    const order = new Order({
      customerName: email,
      customerId: id,
    });
    await order.save();

    res.status(201).json(order);
    io.emit("order-created", order); // Notify clients of new order
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!orderStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
    io.emit("status-updated", order); // Notify clients of status change
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all loggedin user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ customerId: id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
