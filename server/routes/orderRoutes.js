const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  updateOrderStatus,
  getBuyerOrders,
  getSellerOrders,
} = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.put("/:id/status", protect, updateOrderStatus);
router.get("/buyer", protect, getBuyerOrders);
router.get("/seller", protect, getSellerOrders);

module.exports = router;