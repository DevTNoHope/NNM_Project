const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authJwt = require("../middleware/authJwt");

router.post("/login", authController.login);     // demo: email + password (tạm)
router.post("/refresh", authController.refresh); // refresh token
router.get("/me", authJwt, authController.me);

module.exports = router;