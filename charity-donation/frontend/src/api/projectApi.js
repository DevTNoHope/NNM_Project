import { mockGet, mockPost } from './http';
import { MOCK_PROJECTS } from '../utils/mockData';

export const getProjects = () => mockGet(MOCK_PROJECTS);

export const getProjectBySlug = (slug) =>
  mockGet(MOCK_PROJECTS.find(p => p.slug === slug) || null);

export const getFeaturedProjects = () =>
  mockGet(MOCK_PROJECTS.filter(p => p.featured).slice(0, 3));

export const submitDonation = (payload) => mockPost(payload);