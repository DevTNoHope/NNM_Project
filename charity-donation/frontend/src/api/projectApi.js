import http from "./http";

/**
 * =========================
 * PUBLIC PROJECT APIs
 * =========================
 */
export const getProjects = (params = {}) => http.get("/projects", { params });

export const getProjectById = (projectId) => http.get(`/projects/${projectId}`);

export const getFeaturedProjects = () =>
  http.get("/projects", {
    params: { status: "PUBLISHED", featured: true },
  });

export const getDonationsByProjectId = (projectId) =>
  http.get(`/projects/${projectId}/donations`);

/**
 * =========================
 * USER PROJECT DRAFT APIs
 * User có thể tạo/sửa/xóa khi status là DRAFT hoặc REJECTED
 * =========================
 */
export const createProjectDraft = (payload) => {
  const isFormData = payload instanceof FormData;
  return http.post("/projects", payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
};

export const getMyProjects = () => http.get("/projects/me");

export const updateMyProject = (projectId, payload) => {
  const isFormData = payload instanceof FormData;
  return http.put(`/projects/${projectId}`, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
};

export const deleteMyProject = (projectId) =>
  http.delete(`/projects/${projectId}`);

export const submitProjectForReview = (projectId) =>
  http.post(`/projects/${projectId}/submit`);

/**
 * =========================
 * DONATION APIs
 * =========================
 */

export const submitDonation = (projectId, payload) =>
  http.post(`/donations/projects/${projectId}/donate`, payload);

export const getDonationStatus = (donationId) =>
  http.get(`/donations/${donationId}/status`);

export const confirmCryptoDonation = (donationId, payload) =>
  http.post(`/donations/${donationId}/confirm-crypto`, payload);

export const processVnpayReturn = (searchParams) =>
  http.get(`/donations/vnpay-return${searchParams}`);

export const getProjectDonations = (projectId) =>
  http.get(`/projects/${projectId}/donations`);

export const getProjectUpdates = (projectId) =>
  http.get(`/projects/${projectId}/updates`);

export const createProjectUpdate = (projectId, payload) => {
  const isFormData = payload instanceof FormData;
  return http.post(`/projects/${projectId}/updates`, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
};
