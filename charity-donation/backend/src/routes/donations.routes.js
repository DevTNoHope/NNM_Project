const express = require("express");
const router = express.Router();
const donationsController = require("../controllers/donations.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

// Public
router.get("/top", donationsController.getTopDonations);
router.get("/vnpay-return", donationsController.vnpayReturn);

// User & Founder only
router.post(
  "/projects/:projectId/donate",
  authJwt,
  requireRole("USER", "FOUNDER"),
  donationsController.donateToProject,
);
router.post(
  "/:id/confirm-crypto",
  authJwt,
  requireRole("USER", "FOUNDER"),
  donationsController.confirmCryptoDonation,
);
router.get("/:id/status", authJwt, donationsController.getDonationStatus);

module.exports = router;
