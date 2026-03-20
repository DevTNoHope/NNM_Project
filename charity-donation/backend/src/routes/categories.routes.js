const express = require("express");
const categoriesController = require("../controllers/categories.controller");

const router = express.Router();

router.get("/", categoriesController.getAll);
router.get("/:id", categoriesController.getById);
router.get("/:id/projects", categoriesController.getCategoryProjects);
router.post("/", categoriesController.create);
router.put("/:id", categoriesController.update);
router.delete("/:id", categoriesController.remove);

module.exports = router;
