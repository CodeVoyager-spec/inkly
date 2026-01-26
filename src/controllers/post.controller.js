const Category = require("../models/category.model");
const Tag = require("../models/tage.model");
const Post = require("../models/post.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * Get category by ID or by name
 */
const getCategory = async (category) => {
  return mongoose.Types.ObjectId.isValid(category)
    ? Category.findById(category)     
    : Category.findOne({ name: category });
};

/**
 * Get tag IDs by IDs or by names
 */
const getTags = async (tags = []) => {
  if (!tags.length) return []; 

  // check if all tags are ObjectIds
  const areIds = tags.every((tag) =>
    mongoose.Types.ObjectId.isValid(tag)
  );

  return areIds
    ? Tag.find({ _id: { $in: tags } }).distinct("_id")  
    : Tag.find({ name: { $in: tags } }).distinct("_id"); 
};

/**
 * Decide post status and published date
 */
const getPostStatusAndPublishedAt = (status) => {

  const postStatus = Object.values(POST_STATUS).includes(status)
    ? status
    : POST_STATUS.DRAFT;

  const publishedAt =
    postStatus === POST_STATUS.PUBLISHED ? new Date() : null;

  return { postStatus, publishedAt };
};

/**
 * Create a new blog post
 */
exports.createPost = catchAsync(async (req, res) => {
  const { title, content, category, tags = [], status } = req.body;

  // fetch category and tags in parallel
  const [foundCategory, foundTags] = await Promise.all([
    getCategory(category),
    getTags(tags),
  ]);

  // category must exist
  if (!foundCategory) {
    throw new AppError(`Category not found: ${category}`, 404);
  }

  // all tags must be valid
  if (tags.length && foundTags.length !== tags.length) {
    throw new AppError("One or more tags are invalid", 400);
  }

  // determine status and published date
  const { postStatus, publishedAt } = getPostStatusAndPublishedAt(status);

  // optional image upload
  let image = null;
  if (req.file) {
    const uploadedImage = await uploadImage(req.file.buffer, "posts");
    image = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  }

  // create post
  const post = await Post.create({
    title,
    content,
    author: req.user.id,
    category: foundCategory._id,
    tags: foundTags,
    image,
    status: postStatus,
    publishedAt,
  });

  res.status(201).json({
    message: "Post created successfully",
    data: post,
  });
});
