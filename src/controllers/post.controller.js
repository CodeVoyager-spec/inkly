const Post = require("../models/post.model");
const Category = require("../models/category.model");
const Tag = require("../models/tag.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { POST_STATUS } = require("../constants/post.constants");

/**
 * Helper: Compute post status and publishedAt
 */
const getPostStatusAndPublishedAt = (status) => {
  const postStatus = Object.values(POST_STATUS).includes(status)
    ? status
    : POST_STATUS.DRAFT;
  const publishedAt = postStatus === POST_STATUS.PUBLISHED ? new Date() : null;
  return { postStatus, publishedAt };
};

/**
 * POST /posts
 * Create a new blog post
 */
exports.createPost = catchAsync(async (req, res) => {
  const {
    title,
    content,
    category: categoryId,
    tags: tagIds = [],
    status,
  } = req.body;

  // Fetch category and tags in parallel
  const [category, tags] = await Promise.all([
    Category.findById(categoryId).lean(),
    tagIds.length
      ? Tag.find({ _id: { $in: tagIds } }).distinct("_id")
      : Promise.resolve([]),
  ]);

  if (!category)
    throw new AppError(`Category not found with ID: ${categoryId}`, 404);
  if (tagIds.length && tags.length !== tagIds.length) {
    throw new AppError("One or more tags are invalid", 400);
  }
  // Upload image
  const uploadedImage = await uploadImage(req.file.buffer, "posts");

  // Compute status & publishedAt
  const { postStatus, publishedAt } = getPostStatusAndPublishedAt(status);

  const post = await Post.create({
    title,
    content,
    author: req.user.id,
    category: category._id,
    tags,
    image: {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    },
    status: postStatus,
    publishedAt,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("author", "name email")
    .populate("category", "name")
    .populate("tags", "name");

  res.status(201).json({
    message: "Post created successfully",
    data: populatedPost,
  });
});
