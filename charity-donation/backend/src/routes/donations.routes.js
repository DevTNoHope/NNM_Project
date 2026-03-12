const express = require("express");
const router = express.Router();

const donationsController = require("../controllers/donations.controller");
const authJwt = require("../middleware/authJwt");

router.post("/projects/:projectId/donate", authJwt, donationsController.donateToProject);
router.get("/vnpay-return", donationsController.vnpayReturn);
router.get("/:id/status", authJwt, donationsController.getDonationStatus);

module.exports = router;