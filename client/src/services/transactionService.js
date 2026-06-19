import api from './api';

export const transactionService = {
  transfer: (data) => api.post('/transactions/transfer', data),
  getAll: (params) => api.get('/transactions', { params }),
  getFlagged: () => api.get('/transactions/flagged'),
  getStats: () => api.get('/transactions/stats'),
  review: (id, data) => api.patch(`/transactions/${id}/review`, data),
  investigate: (id) => api.post(`/transactions/${id}/investigate`),
};

export const auditService = {
  getAll: (params) => api.get('/audit', { params }),
};
