const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authJwt = require("../middleware/authJwt");
const { createRateLimit } = require("../middleware/rateLimiter");

router.post("/login", createRateLimit({ limit: 10 }), authController.login);
router.post("/wallet/login", createRateLimit({ limit: 10 }), authController.loginWithWallet);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authJwt, authController.me);

module.exports = router;

