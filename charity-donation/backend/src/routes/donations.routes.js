const express = require("express");
const router = express.Router();

const donationsController = require("../controllers/donations.controller");
const authJwt = require("../middleware/authJwt");

// Donate: yêu cầu đăng nhập (nếu bạn muốn guest donate thì bỏ authJwt)
router.post("/projects/:projectId/donate", authJwt, donationsController.donateToProject);

module.exports = router;