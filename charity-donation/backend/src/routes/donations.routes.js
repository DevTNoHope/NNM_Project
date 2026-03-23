const express = require("express");
const router = express.Router();
const donationsController = require("../controllers/donations.controller");
const authJwt = require("../middleware/authJwt");

// Public
router.get("/top", donationsController.getTopDonations);

router.post(
  "/projects/:projectId/donate",
  authJwt,
  donationsController.donateToProject,
);
router.post(
  "/:id/confirm-crypto",
  authJwt,
  donationsController.confirmCryptoDonation,
);
router.get("/vnpay-return", donationsController.vnpayReturn);
router.get("/:id/status", authJwt, donationsController.getDonationStatus);

module.exports = router;
