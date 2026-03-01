const Order = require("../models/Order");
const Product = require("../models/Product");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// CREATE ORDER
const createOrder = async (req, res) => {
  const { productId, pickupPreference } = req.body;

  const product = await Product.findById(productId).populate("seller");

  if (!product || product.status !== "live") {
    return res.status(400).json({ message: "Product not available" });
  }

  if (product.seller._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot buy your own product" });
  }

  // Create or find chat
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, product.seller._id] },
    product: product._id,
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, product.seller._id],
      product: product._id,
    });
  }

  const order = await Order.create({
    product: product._id,
    buyer: req.user._id,
    seller: product.seller._id,
    pickupPreference,
    chat: chat._id,
  });

  // System message
  await Message.create({
    chat: chat._id,
    sender: req.user._id,
    text: `Order placed for "${product.title}". Status: Pending`,
  });

  req.app.get("io").to(product.seller._id.toString()).emit("new order", order);

  res.status(201).json(order);
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!status)
    return res.status(400).json({ message: "Status is required" });

  const order = await Order.findById(req.params.id).populate("product");

  if (!order) return res.status(404).json({ message: "Order not found" });

  const userId = req.user._id.toString();

  // ✅ SELLER ACTIONS
  if (userId === order.seller.toString()) {
    if (["Confirmed", "Rejected"].includes(status)) {
      order.status = status;
    } else if (status === "Cancelled") {
      order.status = "Cancelled";
    } else if (status === "Completed") {
      order.status = "Completed";
      order.product.status = "sold";
      await order.product.save();
    } else {
      return res.status(400).json({ message: "Invalid seller action" });
    }
  }

  // ✅ BUYER ACTIONS
  else if (userId === order.buyer.toString()) {
    if (status === "Cancelled") {
      order.status = "Cancelled";
    } else if (status === "Completed") {
      order.status = "Completed";
      order.product.status = "sold";
      await order.product.save();
    } else {
      return res.status(400).json({ message: "Invalid buyer action" });
    }
  }

  // ❌ NOT BUYER OR SELLER
  else {
    return res.status(403).json({ message: "Not authorized" });
  }

  await order.save();

  if (order.chat) {
    await Message.create({
      chat: order.chat,
      sender: req.user._id,
      text: `Order status updated to: ${status}`,
    });
  }

  // Real-time updates
  req.app.get("io").to(order.buyer.toString()).emit("order update", order);
  req.app.get("io").to(order.seller.toString()).emit("order update", order);

  res.json(order);
};

// GET BUYER ORDERS
const getBuyerOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate("product")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// GET SELLER ORDERS
const getSellerOrders = async (req, res) => {
  const orders = await Order.find({ seller: req.user._id })
    .populate("product buyer")
    .sort({ createdAt: -1 });

  res.json(orders);
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getBuyerOrders,
  getSellerOrders,
};