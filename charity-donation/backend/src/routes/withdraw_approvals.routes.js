const express = require("express");
const router = express.Router();
const withdrawApprovalsController = require("../controllers/withdraw_approvals.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

// Only Admins can access approval routes
router.use(authJwt, requireRole("ADMIN"));

router.get("/", withdrawApprovalsController.getAll);
router.post("/", withdrawApprovalsController.create);
router.get("/:id", withdrawApprovalsController.getById);

module.exports = router;
