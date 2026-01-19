const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { USER_ROLE, USER_STATUS } = require("../constants/user.constants");
const { signAccessToken } = require("../utils/jwt.utils");

/**
 * Signup Controller
 * - Check if userId already exists
 * - Assign status based on role
 * - Create new user
 */
exports.signup = catchAsync(async (req, res) => {
  const { name, userId, email, password, role } = req.body;

  const user = await User.findOne({ userId });
  if (user) {
    throw new AppError("User already exists", 409);
  }

  const status =
    !role || role === USER_ROLE.AUTHOR
      ? USER_STATUS.PENDING
      : USER_STATUS.APPROVED;

  const newUser = await User.create({
    name,
    userId,
    email,
    password,
    role,
    status,
  });

  res.status(201).json({
    success: true,
    data: {
      name: newUser.name,
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    },
  });
});

/**
 * Signin Controller
 * - Validates userId & password
 * - Verifies account status
 * - Allows login only if APPROVED
 * - Generate access token
 */
exports.signin = catchAsync(async (req, res) => {
  const { userId, password } = req.body;

  const user = await User.findOne({ userId }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid userId or password", 401);
  }

  if (user.status === USER_STATUS.BANNED) {
    throw new AppError("Your account has been banned", 403);
  }

  if (user.status === USER_STATUS.PENDING) {
    throw new AppError("Your account is pending approval", 403);
  }

  const accessToken = signAccessToken({ id: user._id });

  res.status(200).json({
    success: true,
    data: {
      name: user.name,
      userId: user.userId,
      email: user.email,
      role: user.role,
      status: user.status,
      token: accessToken,
    },
  });
});
