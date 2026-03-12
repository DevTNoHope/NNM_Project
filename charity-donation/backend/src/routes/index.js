const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const projectsRoutes = require("./projects.routes");
const donationsRoutes = require("./donations.routes");
const adminRoutes = require("./admin.routes");
const categoriesRoutes = require("./categories.routes");
const usersRoutes = require("./user.router");

router.use("/auth", authRoutes);
router.use("/projects", projectsRoutes);
router.use("/donations", donationsRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoriesRoutes);
router.use("/users", usersRoutes);

module.exports = router;
