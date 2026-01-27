const Category = require("../models/category.model");
const Tag = require("../models/tag.model");
const Post = require("../models/post.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const uploadImage = require("../utils/uploadImage");
const { POST_STATUS } = require("../constants/post.constants");

/**
 * POST /posts
 * Create post (Draft by default)
 */
exports.createPost = catchAsync(async (req, res) => {
  const { title, content, category, tags = [] } = req.body;

  const foundCategory = await Category.findById(category).lean();
  if (!foundCategory) throw new AppError("Category not found", 404);

  let validTags = [];
  if (tags.length) {
    validTags = await Tag.find({ _id: { $in: tags } })
      .select("_id")
      .lean();
    if (validTags.length !== tags.length) {
      throw new AppError("One or more tags are invalid", 400);
    }
  }

  let image;
  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer, "posts");
    image = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  const post = await Post.create({
    title,
    content,
    author: req.user._id,
    category,
    tags: validTags.map((t) => t._id),
    image,
    status: POST_STATUS.DRAFT,
    publishedAt: null,
  });

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
});

/**
 * GET /posts
 * Public – published posts only
 */
exports.getAllPosts = catchAsync(async (req, res) => {
  const filter = req.user
    ? req.user.role === "admin"
      ? {}
      : req.user.role === "author"
        ? { $or: [{ status: POST_STATUS.PUBLISHED }, { author: req.user._id }] }
        : { status: POST_STATUS.PUBLISHED }
    : { status: POST_STATUS.PUBLISHED };

  const posts = await Post.find(filter)
    .populate("author", "name")
    .populate("category", "name")
    .populate("tags", "name")
    .sort({ publishedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    results: posts.length,
    data: posts,
  });
});

/**
 * GET /posts/:slug
 * Public – single published post
 */
exports.getPostBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({
    slug,
    status: POST_STATUS.PUBLISHED,
  })
    .populate("author", "name")
    .populate("category", "name")
    .populate("tags", "name")
    .lean();

  if (!post) throw new AppError("Post not found", 404);

  res.status(200).json({
    success: true,
    data: post,
  });
});

/**
 * PUT /posts/:slug
 * Update post (Author own post / Admin)
 */
exports.updatePost = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const { title, content, category, tags } = req.body;

  const post = await Post.findOne({ slug });
  if (!post) throw new AppError("Post not found", 404);

  if (
    req.user.role === "author" &&
    post.author.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Not allowed to update this post", 403);
  }

  if (category) {
    const foundCategory = await Category.findById(category).lean();
    if (!foundCategory) throw new AppError("Category not found", 404);
    post.category = category;
  }

  if (tags) {
    const validTags = await Tag.find({ _id: { $in: tags } })
      .select("_id")
      .lean();
    if (validTags.length !== tags.length) {
      throw new AppError("One or more tags are invalid", 400);
    }
    post.tags = validTags.map((t) => t._id);
  }

  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer, "posts");
    post.image = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }

  if (title) post.title = title;
  if (content) post.content = content;

  await post.save();

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: post,
  });
});

/**
 * PATCH /posts/:slug/publish
 */
exports.publishPost = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug });
  if (!post) throw new AppError("Post not found", 404);

  if (
    req.user.role === "author" &&
    post.author.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Not allowed to publish this post", 403);
  }

  if (post.status === POST_STATUS.PUBLISHED) {
    throw new AppError("Post already published", 400);
  }

  post.status = POST_STATUS.PUBLISHED;
  post.publishedAt = new Date();

  await post.save();

  res.status(200).json({
    success: true,
    message: "Post published successfully",
  });
});

/**
 * PATCH /posts/:slug/unpublish
 */
exports.unpublishPost = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug });
  if (!post) throw new AppError("Post not found", 404);

  if (
    req.user.role === "author" &&
    post.author.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Not allowed to unpublish this post", 403);
  }

  if (post.status === POST_STATUS.DRAFT) {
    throw new AppError("Post already unpublished", 400);
  }

  post.status = POST_STATUS.DRAFT;
  post.publishedAt = null;

  await post.save();

  res.status(200).json({
    success: true,
    message: "Post unpublished successfully",
  });
});

/**
 * DELETE /posts/:slug
 */
exports.deletePost = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug });
  if (!post) throw new AppError("Post not found", 404);

  if (
    req.user.role === "author" &&
    post.author.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Not allowed to delete this post", 403);
  }

  await Post.deleteOne({ slug });

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

/**
 * GET /posts/search
 * Public – Search published posts
 */
exports.searchPosts = catchAsync(async (req, res) => {
  const { q, category, tags, author, page = 1, limit = 10 } = req.query;

  const filter = { status: POST_STATUS.PUBLISHED };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (tags) filter.tags = { $in: tags.split(",") };
  if (author) filter.author = author;

  const skip = (page - 1) * limit;

  const posts = await Post.find(filter)
    .populate("author", "name")
    .populate("category", "name")
    .populate("tags", "name")
    .sort(q ? { score: { $meta: "textScore" } } : { publishedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Post.countDocuments(filter);

  res.status(200).json({
    success: true,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    results: posts.length,
    data: posts,
  });
});
