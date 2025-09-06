const { pool } = require("../config/database");
const { cartItemSchema } = require("../validation/schemas");

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartItems] = await pool.execute(
      `SELECT 
        c.id as cart_id,
        c.quantity,
        i.id,
        i.name,
        i.price,
        i.image_url,
        i.stock,
        (i.price * c.quantity) as total_price
      FROM cart_items c
      JOIN items i ON c.item_id = i.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC`,
      [userId]
    );

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0
    );

    res.json({
      success: true,
      data: {
        items: cartItems,
        total_amount: totalAmount,
        total_items: cartItems.length,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addToCart = async (req, res) => {
  try {
    const { error } = cartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const { item_id, quantity } = req.body;

    // Check if item exists and has enough stock
    const [items] = await pool.execute("SELECT stock FROM items WHERE id = ?", [
      item_id,
    ]);

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (items[0].stock < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // Check if item already in cart
    const [existingCartItems] = await pool.execute(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND item_id = ?",
      [userId, item_id]
    );

    if (existingCartItems.length > 0) {
      const newQuantity = existingCartItems[0].quantity + quantity;

      if (items[0].stock < newQuantity) {
        return res.status(400).json({ error: "Not enough stock available" });
      }

      await pool.execute(
        "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ?",
        [newQuantity, userId, item_id]
      );
    } else {
      await pool.execute(
        "INSERT INTO cart_items (user_id, item_id, quantity) VALUES (?, ?, ?)",
        [userId, item_id, quantity]
      );
    }

    res.json({
      success: true,
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { cart_id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    // Check if cart item belongs to user and get item details
    const [cartItems] = await pool.execute(
      `SELECT c.item_id, i.stock 
       FROM cart_items c
       JOIN items i ON c.item_id = i.id  
       WHERE c.id = ? AND c.user_id = ?`,
      [cart_id, userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (cartItems[0].stock < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    await pool.execute(
      "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
      [quantity, cart_id, userId]
    );

    res.json({
      success: true,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { cart_id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [cart_id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
