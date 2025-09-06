const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(authenticateToken);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:cart_id", updateCartItem);
router.delete("/:cart_id", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
