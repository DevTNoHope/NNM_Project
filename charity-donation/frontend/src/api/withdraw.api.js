import http from './http';

const withdrawApi = {
  getRequests: () => http.get('/withdraw-requests'),

  getRequestById: (id) => http.get(`/withdraw-requests/${id}`),

  getBalance: (projectId, type) =>
    http.get(`/withdraw-requests/balance?projectId=${projectId}&type=${type}`),

  createRequest: (data) => http.post('/withdraw-requests', data),

  verifyRequest: (token) => http.get(`/withdraw-requests/verify?token=${token}`),

  // Admin approvals
  getApprovals: () => http.get('/withdraw-approvals'),

  approveRequest: (data) => http.post('/withdraw-approvals', { ...data, decision: 'APPROVED' }),

  rejectRequest: (data) => http.post('/withdraw-approvals', { ...data, decision: 'REJECTED' }),

  // Founder submits tx_hash after claiming on-chain
  submitClaim: (data) => http.post('/withdraw-requests/claim', data),
};

export default withdrawApi;
