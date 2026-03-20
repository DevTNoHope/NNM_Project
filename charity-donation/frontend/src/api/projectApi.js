import http from './http';

export const getProjects = () => http.get('/projects');

export const getProjectBySlug = (slug) => http.get(`/projects/${slug}`);

export const getFeaturedProjects = () => http.get('/projects');

export const submitDonation = (projectId, payload) =>
  http.post(`/api/donations/projects/${projectId}/donate`, payload);

export const getDonationStatus = (donationId) =>
  http.get(`/api/donations/${donationId}/status`);

export const processVnpayReturn = (searchParams) =>
  http.get(`/api/donations/vnpay-return${searchParams}`);