const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/wallet/login", authController.loginWithWallet);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
