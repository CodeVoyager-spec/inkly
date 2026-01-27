const { Router } = require("express");
const { createPost } = require("../controllers/post.controller");
const { uploadSingleImage } = require("../middlewares/upload.middleware");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", isAuthenticated, uploadSingleImage, createPost);

module.exports = router;
