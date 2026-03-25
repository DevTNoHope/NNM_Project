export const filterProjects = (
  projects,
  { search = '', status = 'All', category = 'All', sort = 'newest' } = {}
) => {
  if (!Array.isArray(projects)) return [];

  let filtered = [...projects];

  // Search filtering is now handled by the backend MySQL MATCH() AGAINST()
  // if (search.trim()) { ... }

  if (status !== 'All') {
    filtered = filtered.filter((p) => p?.status === status.toUpperCase());
  }

  if (category !== 'All') {
    filtered = filtered.filter((p) => p?.category_name === category);
  }

  switch (sort) {
    case 'most_funded':
      filtered.sort((a, b) => (Number(b?.total_donated) || 0) - (Number(a?.total_donated) || 0));
      break;
    case 'goal_high':
      filtered.sort((a, b) => (Number(b?.goal_amount) || 0) - (Number(a?.goal_amount) || 0));
      break;
    case 'goal_low':
      filtered.sort((a, b) => (Number(a?.goal_amount) || 0) - (Number(b?.goal_amount) || 0));
      break;
    default:
      if (!search.trim()) {
        filtered.sort(
          (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
        );
      }
  }

  return filtered;
};