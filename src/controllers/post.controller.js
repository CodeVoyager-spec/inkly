const Category = require("../models/category.model");
const Tag = require("../models/tag.model");
const Post = require("../models/post.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const uploadImage = require("../utils/uploadImage");
const { POST_STATUS } = require("../constants/post.constants");

/**
 * POST /posts
 * Create a new blog post
 * 1. Fetch category and tags
 * 2. Upload image (optional)
 * 3. Create post in database
 * 4. Return created post
 */
exports.createPost = catchAsync(async (req, res) => {
  const { title, content, category, tags = [], status } = req.body;

  const validStatuses = new Set(Object.values(POST_STATUS));
  const postStatus = validStatuses.has(status) ? status : POST_STATUS.DRAFT;
  const publishedAt = postStatus === POST_STATUS.PUBLISHED ? new Date() : null;

  const foundCategory = await Category.findById(category);
  if (!foundCategory) {
    throw new AppError("Category not found", 404);
  }

  let foundTags = [];
  if (tags.length) {
    foundTags = await Tag.find({ _id: { $in: tags } }).distinct("_id");
    if (foundTags.length !== tags.length) {
      throw new AppError("One or more tags are invalid", 400);
    }
  }

  let uploadedImage = null;
  if (req.file) {
    uploadedImage = await uploadImage(req.file.buffer, "posts");
  }

  const post = await Post.create({
    title,
    content,
    author: req.user.id, 
    category: foundCategory._id,
    tags: foundTags,
    image: uploadedImage ? { url: uploadedImage.secure_url, publicId: uploadedImage.public_id } : null,
    status: postStatus,
    publishedAt,
  });

  res.status(201).json({
    message: "Post created successfully",
    data: post,
  });
});
