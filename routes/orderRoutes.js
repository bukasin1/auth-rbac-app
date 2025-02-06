const express = require("express");
const {
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getOrders,
} = require("../controllers/orderController");
const { authorizeRoles } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authorizeRoles("shipper", "admin", "carrier"), createOrder);
router.put("/:id", authorizeRoles("carrier", "admin"), updateOrderStatus);
router.get("/", getUserOrders);
router.get("/all", authorizeRoles("admin"), getOrders);

module.exports = router;
