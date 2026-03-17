import http from "./http";

export const getPlatformStats = () => http.get("/api/stats/platform");
export const getNewlyEligibleProjects = (page = 0, limit = 3) => http.get(`/api/projects/newly-eligible?page=${page}&limit=${limit}`);
export const getTopDonations = (limit = 5) => http.get(`/api/donations/top?limit=${limit}`);
export const getRecentProjects = (limit = 3) => http.get(`/api/projects/recent?limit=${limit}`);
export const getLastUpdatedProjects = (limit = 6) => http.get(`/api/projects/last-updated?limit=${limit}`);
