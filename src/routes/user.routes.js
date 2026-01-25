const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const authorize = require("../middlewares/authorize");
const { USER_ROLE } = require("../constants/user.constants");

router.use(isAuthenticated, authorize(USER_ROLE.ADMIN));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.patch("/:id/role", userController.updateUserRole);
router.patch("/:id/ban", userController.banUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
