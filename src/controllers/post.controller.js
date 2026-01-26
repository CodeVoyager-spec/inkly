const Post = require("../models/post.model");
const Category = require("../models/category.model");
const Tag = require("../models/tag.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { POST_STATUS } = require("../constants/post.constants");

exports.createPost = catchAsync(async (req, res) => {
  const { title, content, category: categoryId, tags: tagIds = [], status } = req.body;

  // Fetch category and tags in parallel
  const [category, tags] = await Promise.all([
    Category.findById(categoryId),
    tagIds.length ? Tag.find({ _id: { $in: tagIds } }) : Promise.resolve([]),
  ]);

  if (!category) throw new AppError(`Category not found with ID: ${categoryId}`, 404);
  if (tags.length !== tagIds.length) throw new AppError("One or more tags are invalid", 400);

  // Create post in one shot
  const post = await Post.create({
    title,
    content,
    author: req.user._id,
    category: category._id,
    tags: tags.map((t) => t._id),
    status: Object.values(POST_STATUS).includes(status) ? status : POST_STATUS.DRAFT,
    publishedAt: status === POST_STATUS.PUBLISHED ? new Date() : null,
  });

  // Populate references in response
  const populatedPost = await Post.findById(post._id)
    .populate("category", "name")
    .populate("tags", "name")
    .populate("author", "name email");

  res.status(201).json({
    message: "Post created successfully",
    data: populatedPost,
  });
});
