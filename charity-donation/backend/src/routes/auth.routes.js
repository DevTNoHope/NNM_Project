const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authJwt, authController.me);
router.post("/wallet/login", authController.loginWithWallet);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
