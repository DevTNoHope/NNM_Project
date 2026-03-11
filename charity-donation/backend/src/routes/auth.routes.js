const express = require("express");
const authController = require("../controllers/auth.controller");
const authJwt = require("../middleware/authJwt");

const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authJwt, authController.me);

module.exports = router;