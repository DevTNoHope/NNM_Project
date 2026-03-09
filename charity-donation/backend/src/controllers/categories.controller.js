const categoriesService = require("../services/categories.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    const data = await categoriesService.getCategories();
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await categoriesService.getCategoryById(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await categoriesService.createCategory(req.body);
    return ok(res, data, "Category created successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
