const { Router } = require("express");
const profileController = require("../controllers/profile.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = Router();

router.use(isAuthenticated)

// GET    /inkly/api/v1/profile/me
router.get("/me", profileController.getProfile);
// PUT    /inkly/api/v1/profile/me
router.put("/me", profileController.updateProfile);
// DELETE   /inkly/api/v1/profile/me
router.delete("/me", profileController.deleteMyProfile);

module.exports = router;
