const ApiError = require("../utils/apiError");
const categoriesModel = require("../models/categories.model");

async function getCategories() {
  return categoriesModel.findAll();
}

async function getCategoryById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid category id");

  const category = await categoriesModel.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  return category;
}

async function createCategory(payload) {
  const { name } = payload;
  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Name is required");
  }

  const newId = await categoriesModel.create({ name });
  return { id: newId };
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory
};
