const AppError = require("../utils/AppError");
const User = require("../models/user.model");
const { USER_STATUS } = require("../constants/user.constants");
const { verifyAccessToken } = require("../utils/jwt.utils");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    if (user.status === USER_STATUS.BANNED) {
      throw new AppError("User is banned", 403);
    }

    if (user.status === USER_STATUS.DELETED) {
      throw new AppError("User account deleted", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = isAuthenticated;
