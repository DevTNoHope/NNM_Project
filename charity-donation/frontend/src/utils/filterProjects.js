export const filterProjects = (projects, { search = '', status = 'All', category = 'All', sort = 'newest' }) => {
  let filtered = [...projects];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.excerpt.toLowerCase().includes(q)
    );
  }

  if (status !== 'All') {
    if (status === 'Verified') filtered = filtered.filter(p => p.verified);
    else if (status === 'Active') filtered = filtered.filter(p => p.active);
    else if (status === 'Featured') filtered = filtered.filter(p => p.featured);
  }

  if (category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }

  switch (sort) {
    case 'most_funded': filtered.sort((a, b) => b.raised - a.raised); break;
    case 'goal_high': filtered.sort((a, b) => b.goal - a.goal); break;
    case 'goal_low': filtered.sort((a, b) => a.goal - b.goal); break;
    default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return filtered;
};