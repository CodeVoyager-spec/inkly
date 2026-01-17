const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
