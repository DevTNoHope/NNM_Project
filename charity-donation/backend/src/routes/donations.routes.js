const express = require("express");
const router = express.Router();
const donationsController = require("../controllers/donations.controller");
const authJwt = require("../middleware/authJwt");

// Public
router.get("/top", donationsController.getTopDonations);

// Protected
router.post("/:projectId", authJwt, donationsController.donateToProject);
router.get("/status/:id", authJwt, donationsController.getDonationStatus);

// VNPay - Public callback
router.get("/vnpay/return", donationsController.vnpayReturn);

module.exports = router;