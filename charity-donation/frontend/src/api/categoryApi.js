import http from './http';

/**
 * =========================
 * CATEGORY APIs
 * =========================
 */
export const getCategories = () =>
  http.get("/categories");

export const getCategoryById = (categoryId) =>
  http.get(`/categories/${categoryId}`);
