const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const usersController = require("../controllers/user.controller");

// Profile của chính mình
router.get("/me", verifyToken, usersController.getMe);
router.put("/me", verifyToken, usersController.updateMe);
router.get("/me/badges", verifyToken, usersController.getMyBadges);
router.get("/me/badge-progress", verifyToken, usersController.getMyBadgeProgress);
router.patch("/me/selected-badge", verifyToken, usersController.setMySelectedBadge);

// Verify account
router.post(
  "/send-verification-otp",
  verifyToken,
  usersController.sendVerificationOtp,
);

router.post("/verify-otp", verifyToken, usersController.verifyOtp);

// Public profile
router.get("/:userId/profile", usersController.getPublicProfile);
router.get("/:userId/projects", usersController.getUserProjects);
router.get("/:userId/donations", usersController.getUserDonations);
router.get("/:userId/badges", usersController.getPublicBadges);
router.get("/:userId/badge-progress", usersController.getPublicBadgeProgress);

module.exports = router;
