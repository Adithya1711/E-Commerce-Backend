const { pool } = require("../config/database");
const { itemSchema } = require("../validation/schemas");

const getItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    let query = `
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += " AND i.category_id = ?";
      params.push(category);
    }

    if (minPrice) {
      query += " AND i.price >= ?";
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += " AND i.price <= ?";
      params.push(parseFloat(maxPrice));
    }

    if (search) {
      query += " AND (i.name LIKE ? OR i.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY i.created_at DESC";

    const [items] = await pool.execute(query, params);

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute(
      "SELECT i.*, c.name as category_name FROM items i LEFT JOIN categories c ON i.category_id = c.id WHERE i.id = ?",
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({
      success: true,
      data: items[0],
    });
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      "SELECT * FROM categories ORDER BY name"
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getItems,
  getItemById,
  getCategories,
};
