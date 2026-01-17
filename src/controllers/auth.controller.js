const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { USER_ROLE, USER_STATUS } = require("../constants/user.constants");

/**
 * Signup Controller
 * - Check if userId already exists
 * - Assign status based on role
 * - Create new user
 */
exports.signup = catchAsync(async (req, res) => {
  const { name, userId, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ userId });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  // Determine user status based on role
  const status =
    !role || role === USER_ROLE.AUTHOR
      ? USER_STATUS.PENDING
      : USER_STATUS.APPROVED;

  // Create new user
  const newUser = await User.create({
    name,
    userId,
    email,
    password,
    role,
    status,
  });

  // Send response
  res.status(201).json({
    success: true,
    data: {
      name: newUser.name,
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    },
  });
});

/**
 * Signin Controller
 * - Validates userId & password
 * - Verifies account status
 * - Allows login only if APPROVED
 */
exports.signin = catchAsync(async (req, res) => {
  const { userId, password } = req.body;

  // Find user with password
  const user = await User.findOne({ userId }).select("+password");

  // Invalid credentials
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid userId or password", 401);
  }

  // Account status checks
  if (user.status === USER_STATUS.BANNED) {
    throw new AppError("Your account has been banned", 403);
  }

  if (user.status === USER_STATUS.PENDING) {
    throw new AppError("Your account is pending approval", 403);
  }

  // Successful login
  res.status(200).json({
    success: true,
    data: {
      name: user.name,
      userId: user.userId,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});
