const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Get logged-in user's account
 */
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({ data: user });
});

/**
 * Update logged-in user's account
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Your profile updated successfully",
    data: user,
  });
});

/**
 * Deactivate logged-in user's account (soft delete)
 */
exports.deleteMyProfile = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    status: USER_STATUS.DELETED,
  });

  res.status(200).json({
    message: "Account deactivated successfully",
  });
});
