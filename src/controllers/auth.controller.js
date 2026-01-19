const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { USER_ROLE, USER_STATUS } = require("../constants/user.constants");
const { signAccessToken } = require("../utils/jwt.utils");

// Helper to send safe user data
const sanitizeUser = (user) => ({
  name: user.name,
  userId: user.userId,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

const STATUS_MESSAGES = {
  [USER_STATUS.BANNED]: "Your account has been banned",
  [USER_STATUS.PENDING]: "Your account is pending approval",
};

/**
 * Signup Controller
 */
exports.signup = catchAsync(async (req, res) => {
  const { name, userId, email, password, role } = req.body;

  if (await User.exists({ userId })) {
    throw new AppError("User already exists", 409);
  }

  const status =
    !role || role === USER_ROLE.READER
      ? USER_STATUS.APPROVED
      : USER_STATUS.PENDING;

  const user = await User.create({ name, userId, email, password, role, status });

  res.status(201).json({
    success: true,
    data: sanitizeUser(user),
  });
});

/**
 * Signin Controller
 */
exports.signin = catchAsync(async (req, res) => {
  const { userId, password } = req.body;

  const user = await User.findOne({ userId }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid userId or password", 401);
  }

  if (user.status !== USER_STATUS.APPROVED) {
    throw new AppError(STATUS_MESSAGES[user.status], 403);
  }

  const token = signAccessToken({ id: user._id });

  res.status(200).json({
    success: true,
    data: {
      ...sanitizeUser(user),
      token,
    },
  });
});
