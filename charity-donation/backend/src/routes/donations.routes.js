const express = require("express");
const router = express.Router();
const donationsController = require("../controllers/donations.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");
const { createRateLimit } = require("../middleware/rateLimiter");

// Public
router.get("/top", donationsController.getTopDonations);
router.get("/vnpay-return", donationsController.vnpayReturn);

// User & Founder only
router.post(
  "/projects/:projectId/donate",
  createRateLimit({ limit: 30 }),
  authJwt,
  requireRole("USER", "FOUNDER"),
  donationsController.donateToProject,
);
router.post(
  "/:id/confirm-crypto",
  createRateLimit({ limit: 30 }),
  authJwt,
  requireRole("USER", "FOUNDER"),
  donationsController.confirmCryptoDonation,
);
router.get("/:id/status", authJwt, donationsController.getDonationStatus);

module.exports = router;
