const authController = require("../controllers/auth.controller");
const { Router } = require("express");

const router = Router();

router.post("/signup", authController.signup);

module.exports = router;
