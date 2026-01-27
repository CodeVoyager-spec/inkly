const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const {
  isAuthenticated,
  authorize,
} = require("../middlewares/auth.middleware");
const { uploadSingleImage } = require("../middlewares/upload.middleware");

/**
 * Public / Role-aware Routes
 * These routes work for guests as well as logged-in users
 */
router.get("/", postController.getAllPosts);       
router.get("/search", postController.searchPosts); 
router.get("/:slug", postController.getPostBySlug); 

/**
 * Protected routes (Admin + Author)
 */
router.post(
  "/",
  isAuthenticated,
  authorize("admin", "author"),
  uploadSingleImage,
  postController.createPost,
);

router.put(
  "/:slug",
  isAuthenticated,
  authorize("admin", "author"),
  uploadSingleImage,
  postController.updatePost,
);

router.patch(
  "/:slug/publish",
  isAuthenticated,
  authorize("admin", "author"),
  postController.publishPost,
);

router.patch(
  "/:slug/unpublish",
  isAuthenticated,
  authorize("admin", "author"),
  postController.unpublishPost,
);

router.delete(
  "/:slug",
  isAuthenticated,
  authorize("admin", "author"),
  postController.deletePost,
);

module.exports = router;
