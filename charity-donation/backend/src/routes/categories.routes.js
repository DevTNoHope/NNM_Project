const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// Public
router.get("/", categoriesController.getAll);
router.get("/:id", categoriesController.getById);
router.get("/:id/projects", categoriesController.getCategoryProjects);

// Admin only
router.post("/", authJwt, requireRole("ADMIN"), categoriesController.create);
router.put("/:id", authJwt, requireRole("ADMIN"), categoriesController.update);
router.delete("/:id", authJwt, requireRole("ADMIN"), categoriesController.remove);

module.exports = router;
