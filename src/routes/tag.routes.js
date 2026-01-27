const express = require("express");
const router = express.Router();

const tagController = require("../controllers/tag.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const authorize = require("../middlewares/authorize");

/**
 * Admin & Author
 */
router.post(
  "/",
  isAuthenticated,
  authorize("admin", "author"),
  tagController.createTag,
);

router.put(
  "/:tagId",
  isAuthenticated,
  authorize("admin", "author"),
  tagController.updateTag,
);

router.delete(
  "/:tagId",
  isAuthenticated,
  authorize("admin"),
  tagController.deleteTag,
);

/**
 * Public
 */
router.get("/", tagController.getAllTags);
router.get("/:tagId", tagController.getTagById);

module.exports = router;
