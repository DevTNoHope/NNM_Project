import http from './http';

export const getPosts = () => http.get('/posts');

export const getPostBySlug = (slug) =>
  http.get(`/posts/${slug}`);

export const getFeaturedPost = () =>
  http.get('/posts/featured');