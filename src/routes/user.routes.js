const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const authorize = require("../middlewares/authorize");
const { USER_ROLE } = require("../constants/user.constants");

router.use(isAuthenticated, authorize(USER_ROLE.ADMIN));

// GET    /inkly/api/v1/users
router.get("/", userController.getAllUsers);
// GET    /inkly/api/v1/users/:id
router.get("/:id", userController.getUserById);
// PUT    /inkly/api/v1/users/:id
router.put("/:id", userController.updateUser);
// PATCH /inkly/api/v1/users/:id/role
router.patch("/:id/role", userController.updateUserRole);
// PATCH /inkly/api/v1/users/:id/ban
router.patch("/:id/ban", userController.banUser);
// DELETE /inkly/api/v1/users/:id
router.delete("/:id", userController.deleteUser);

module.exports = router;
