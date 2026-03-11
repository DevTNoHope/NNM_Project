import http from './http';

export const getProjects = () => http.get('/projects');

export const getProjectBySlug = (slug) =>
  http.get(`/projects/${slug}`);

export const getFeaturedProjects = () =>
  http.get('/projects/featured');

export const submitDonation = (payload) =>
  http.post('/donations', payload);