const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authJwt = require("../middleware/authJwt");

router.post("/login", authController.login);
router.post("/wallet/login", authController.loginWithWallet);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authJwt, authController.me);

module.exports = router;
