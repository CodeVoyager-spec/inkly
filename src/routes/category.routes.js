const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const authorize = require("../middlewares/authorize");

/**
 * Admin only
 */
router.post(
  "/",
  isAuthenticated,
  authorize("admin"),
  categoryController.createCategory,
);

router.put(
  "/:categoryId",
  isAuthenticated,
  authorize("admin"),
  categoryController.updateCategory,
);

router.delete(
  "/:categoryId",
  isAuthenticated,
  authorize("admin"),
  categoryController.deleteCategory,
);

/**
 * Public
 */
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);

module.exports = router;
