const USER_ROLE = {
  ADMIN: "admin",
  AUTHOR: "author",
  READER: "reader",
};

const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  BANNED: "banned",
  DELETED: "deleted"
};

module.exports = {
  USER_ROLE,
  USER_STATUS,
  ALLOWED_USER_FIELDS
};
