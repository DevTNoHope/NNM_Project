const express = require("express");
const router = express.Router();
const withdrawRequestsController = require("../controllers/withdraw_requests.controller");
const authJwt = require("../middleware/authJwt");

// Public/Verification routes (no auth required for verify via token)
router.get("/verify", withdrawRequestsController.verify);

// Protected routes
router.use(authJwt);

router.get("/", withdrawRequestsController.getAll);
router.get("/balance", withdrawRequestsController.getBalance);
router.post("/", withdrawRequestsController.create);
router.post("/claim", withdrawRequestsController.submitClaimTxHash);
router.get("/:id", withdrawRequestsController.getById);

module.exports = router;
