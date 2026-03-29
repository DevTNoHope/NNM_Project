export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Community', path: '/community' },
  { label: 'About', path: '/about' },
];

export const PROJECT_CATEGORIES = [
  'All', 'Education', 'Healthcare', 'Environment', 'Poverty', 'Animals', 'Technology', 'Arts',
];

export const PROJECT_STATUSES = ['All', 'Active', 'Verified', 'Featured'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'goal_high', label: 'Goal: High to Low' },
  { value: 'goal_low', label: 'Goal: Low to High' },
];

export const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

export const PAYMENT_METHODS = ['VNPay', 'Crypto'];

export const THEME_KEY = 'hopefund_theme';

// Blockchain URLs — read from env to support testnet/mainnet switching
export const BSC_EXPLORER_URL = import.meta.env.VITE_BSC_EXPLORER_URL || 'https://testnet.bscscan.com';
export const IPFS_GATEWAY_URL = import.meta.env.VITE_IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

// Helper functions for building explorer URLs
export const getTxUrl = (txHash) => `${BSC_EXPLORER_URL}/tx/${txHash}`;
export const getAddressUrl = (address) => `${BSC_EXPLORER_URL}/address/${address}`;
export const getIpfsUrl = (cid) => `${IPFS_GATEWAY_URL}/${cid}`;