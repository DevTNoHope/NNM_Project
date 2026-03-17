const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const projectsRoutes = require("./projects.routes");
const donationsRoutes = require("./donations.routes");
const statsRoutes = require("./stats.routes");

router.use("/auth", authRoutes);
router.use("/projects", projectsRoutes);
router.use("/donations", donationsRoutes);
router.use("/stats", statsRoutes);

module.exports = router;