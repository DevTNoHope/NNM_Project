const express = require("express");
const router = express.Router();
const withdrawRequestsController = require("../controllers/withdraw_requests.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

// Public (email verification link)
router.get("/verify", withdrawRequestsController.verify);

// Founder & Admin
router.get("/", authJwt, requireRole("FOUNDER", "ADMIN"), withdrawRequestsController.getAll);
router.get("/balance", authJwt, requireRole("FOUNDER", "ADMIN"), withdrawRequestsController.getBalance);
router.get("/:id", authJwt, requireRole("FOUNDER", "ADMIN"), withdrawRequestsController.getById);

// Founder only
router.post("/", authJwt, requireRole("FOUNDER"), withdrawRequestsController.create);
router.post("/claim", authJwt, requireRole("FOUNDER"), withdrawRequestsController.submitClaimTxHash);

module.exports = router;
