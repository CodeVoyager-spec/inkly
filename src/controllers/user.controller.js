const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { USER_ROLE, USER_STATUS } = require("../constants/user.constants");

/**
 * GET /users (ADMIN)
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const { role, status, page = 1, limit = 10 } = req.query;

  const filter = { };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    meta: { page: +page, limit: +limit, total },
  });
});

/**
 * GET /users/:id (ADMIN)
 */
exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findActiveById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({
    message: "User fetched successfully",
    data: user,
  });
});

/**
 * PUT /users/:id (ADMIN)
 */
exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findActiveById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  Object.assign(user, req.body);
  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
});

/**
 * PATCH /users/:id/role (ADMIN)
 */
exports.updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;

  if (!Object.values(USER_ROLE).includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const user = await User.findActiveById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  user.role = role;
  await user.save();

  res.status(200).json({
    message: "User role updated successfully",
    data: { id: user._id, role: user.role },
  });
});

/**
 * PATCH /users/:id/ban (ADMIN)
 */
exports.banUser = catchAsync(async (req, res) => {
  const user = await User.findActiveById(req.params.id);

  if (!user) throw new AppError("User not found", 404);
  if (user.status === USER_STATUS.BANNED) {
    throw new AppError("User already banned", 400);
  }

  user.status = USER_STATUS.BANNED;
  await user.save();

  res.status(200).json({ message: "User banned successfully" });
});

/**
 * DELETE /users/:id (ADMIN) – Soft delete
 */
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findActiveById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  user.status = USER_STATUS.DELETED;
  await user.save();

  res.status(200).json({ message: "User deleted successfully" });
});
