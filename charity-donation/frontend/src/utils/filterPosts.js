export const filterPosts = (posts, { search = '', category = 'All' }) => {
  let filtered = [...posts];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }

  return filtered;
};