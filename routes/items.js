const express = require("express");
const {
  getItems,
  getItemById,
  getCategories,
} = require("../controllers/itemController");

const router = express.Router();

router.get("/", getItems);
router.get("/categories", getCategories);
router.get("/:id", getItemById);

module.exports = router;
