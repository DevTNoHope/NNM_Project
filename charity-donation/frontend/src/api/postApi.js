import { mockGet } from './http';
import { MOCK_POSTS } from '../utils/mockData';

export const getPosts = () => mockGet(MOCK_POSTS);

export const getPostBySlug = (slug) =>
  mockGet(MOCK_POSTS.find(p => p.slug === slug) || null);

export const getFeaturedPost = () =>
  mockGet(MOCK_POSTS.find(p => p.featured) || MOCK_POSTS[0]);