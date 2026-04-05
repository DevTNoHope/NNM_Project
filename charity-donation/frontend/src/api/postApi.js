import http from './http';

export const getPosts = () => http.get('/api/posts');

export const getPostBySlug = (slug) =>
  http.get(`/api/posts/${slug}`);

export const getFeaturedPost = () =>
  http.get('/api/posts/featured');