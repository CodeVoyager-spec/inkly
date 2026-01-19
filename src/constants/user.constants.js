const USER_ROLE = {
  ADMIN: "admin",
  AUTHOR: "author",
  READER: "reader",
};

const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  BANNED: "banned",
};

ALLOWED_USER_FIELDS = ["name", "userId", "email", "password", "role"];


module.exports = {
  USER_ROLE,
  USER_STATUS,
  ALLOWED_USER_FIELDS
};
