export const filterProjects = (
  projects,
  { search = '', status = 'All', category = 'All', sort = 'newest' } = {}
) => {
  if (!Array.isArray(projects)) return [];

  let filtered = [...projects];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => {
      const title = p?.title?.toLowerCase?.() || '';
      const organization = p?.organization?.toLowerCase?.() || '';
      const excerpt = p?.excerpt?.toLowerCase?.() || '';
      const tags = Array.isArray(p?.tags) ? p.tags : [];

      return (
        title.includes(q) ||
        organization.includes(q) ||
        tags.some((t) => String(t).toLowerCase().includes(q)) ||
        excerpt.includes(q)
      );
    });
  }

  if (status !== 'All') {
    if (status === 'Verified') filtered = filtered.filter((p) => p?.verified);
    else if (status === 'Active') filtered = filtered.filter((p) => p?.active);
    else if (status === 'Featured') filtered = filtered.filter((p) => p?.featured);
  }

  if (category !== 'All') {
    filtered = filtered.filter((p) => p?.category === category);
  }

  switch (sort) {
    case 'most_funded':
      filtered.sort((a, b) => (Number(b?.raised) || 0) - (Number(a?.raised) || 0));
      break;
    case 'goal_high':
      filtered.sort((a, b) => (Number(b?.goal) || 0) - (Number(a?.goal) || 0));
      break;
    case 'goal_low':
      filtered.sort((a, b) => (Number(a?.goal) || 0) - (Number(b?.goal) || 0));
      break;
    default:
      filtered.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );
  }

  return filtered;
};