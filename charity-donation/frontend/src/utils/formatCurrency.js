export const formatCurrency = (amount) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

export const calcProgress = (raised, goal) => Math.min(Math.round((raised / goal) * 100), 100);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });