const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const projectsRoutes = require("./projects.routes");
const donationsRoutes = require("./donations.routes");
const statsRoutes = require("./stats.routes");
const adminRoutes = require("./admin.routes");
const categoriesRoutes = require("./categories.routes");
const usersRoutes = require("./user.router");
const withdrawRequestsRoutes = require("./withdraw_requests.routes");
const withdrawApprovalsRoutes = require("./withdraw_approvals.routes");
const notificationsRoutes = require("./notifications.route");

router.use("/auth", authRoutes);
router.use("/projects", projectsRoutes);
router.use("/donations", donationsRoutes);
router.use("/stats", statsRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoriesRoutes);
router.use("/users", usersRoutes);
router.use("/withdraw-requests", withdrawRequestsRoutes);
router.use("/withdraw-approvals", withdrawApprovalsRoutes);
router.use("/notifications", notificationsRoutes);

module.exports = router;
