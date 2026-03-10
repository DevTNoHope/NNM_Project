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

async function update(req, res, next) {
  try {
    const data = await categoriesService.updateCategory(req.params.id, req.body);
    return ok(res, data, "Category updated successfully");
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await categoriesService.deleteCategory(req.params.id);
    return ok(res, data, "Category deleted successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
