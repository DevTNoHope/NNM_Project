import http from './http';

/**
 * =========================
 * PUBLIC PROJECT APIs
 * =========================
 */
export const getProjects = (params = {}) =>
  http.get("/projects", { params });

export const getProjectById = (projectId) =>
  http.get(`/projects/${projectId}`);

export const getFeaturedProjects = () =>
  http.get("/projects", {
    params: { status: "PUBLISHED", featured: true },
  });

/**
 * =========================
 * USER PROJECT DRAFT APIs
 * User có thể tạo/sửa/xóa khi status là DRAFT hoặc REJECTED
 * =========================
 */
export const createProjectDraft = (payload) =>
  http.post("/projects", payload);

export const getMyProjects = () =>
  http.get("/projects/me");

export const updateMyProject = (projectId, payload) =>
  http.put(`/projects/${projectId}`, payload);

export const deleteMyProject = (projectId) =>
  http.delete(`/projects/${projectId}`);

export const submitProjectForReview = (projectId) =>
  http.post(`/projects/${projectId}/submit`);

/**
 * =========================
 * FOUNDER PROJECT MANAGEMENT APIs
 * Founder chỉ quản lý project đã được duyệt/publish
 * Không edit/delete trực tiếp project published
 * =========================
 */
export const getFounderProjects = () =>
  http.get("/projects/founder/me");

/**
 * =========================
 * DONATION APIs
 * =========================
 */

export const submitDonation = (projectId, payload) =>
  http.post(`/api/donations/projects/${projectId}/donate`, payload);

export const getDonationStatus = (donationId) =>
  http.get(`/api/donations/${donationId}/status`);

export const processVnpayReturn = (searchParams) =>
  http.get(`/api/donations/vnpay-return${searchParams}`);