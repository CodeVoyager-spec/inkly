const Tag = require("../models/tag.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Create tag
 * (Admin or Author)
 */
const createTag = catchAsync(async (req, res) => {
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
const getAllTags = catchAsync(async (req, res) => {
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
const getTagById = catchAsync(async (req, res) => {
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
const updateTag = catchAsync(async (req, res) => {
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
const deleteTag = catchAsync(async (req, res) => {
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

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
};
