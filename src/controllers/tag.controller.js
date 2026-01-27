const Tag = require("../models/tag.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Create tag
 * (Admin or Author)
 */
exports.createTag = catchAsync(async (req, res) => {
  const { name } = req.body;

  const tag = await Tag.create({ name });

  res.status(201).json({
    success: true,
    message: "Tag created successfully",
    data: tag,
  });
});

/**
 * Get all tags
 */
exports.getAllTags = catchAsync(async (req, res) => {
  const tags = await Tag.find().lean();

  res.status(200).json({
    success: true,
    results: tags.length,
    data: tags,
  });
});

/**
 * Get tag by ID
 */
exports.getTagById = catchAsync(async (req, res) => {
  const { tagId } = req.params;

  const tag = await Tag.findById(tagId).lean();

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  res.status(200).json({
    success: true,
    data: tag,
  });
});

/**
 * Update tag
 */
exports.updateTag = catchAsync(async (req, res) => {
  const { tagId } = req.params;
  const { name } = req.body;

  const updatedTag = await Tag.findByIdAndUpdate(
    tagId,
    { name },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTag) {
    throw new AppError("Tag not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Tag updated successfully",
    data: updatedTag,
  });
});

/**
 * Delete tag
 */
exports.deleteTag = catchAsync(async (req, res) => {
  const { tagId } = req.params;

  const deletedTag = await Tag.findByIdAndDelete(tagId);

  if (!deletedTag) {
    throw new AppError("Tag not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Tag deleted successfully",
  });
});
