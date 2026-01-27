const Category = require("../models/category.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Create category
 */
exports.createCategory = catchAsync(async (req, res) => {
  const { name, description, parentCategory } = req.body;

  const category = await Category.create({
    name,
    description,
    parentCategory: parentCategory || null,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

/**
 * Get all categories
 */
exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find().populate("parentCategory").lean();

  res.status(200).json({
    success: true,
    results: categories.length,
    data: categories,
  });
});

/**
 * Get category by ID
 */
exports.getCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId)
    .populate("parentCategory")
    .lean();

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * Update category
 */
exports.updateCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, parentCategory } = req.body;

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      name,
      description,
      parentCategory,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

/**
 * Delete category
 */
exports.deleteCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
