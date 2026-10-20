const API_BASE = '/api';

/**
 * Universal fetch wrapper handling authorization headers & JSON response
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ecitizen_token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (identifier, password) => request('/auth/login', {
      method: 'POST',
      body: { identifier, password }
    }),
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: userData
    }),
    getMe: () => request('/auth/me'),
    getNotifications: () => request('/auth/notifications'),
    markNotificationsRead: () => request('/auth/notifications/read', {
      method: 'PATCH'
    })
  },

  // Service Requests
  requests: {
    submit: (formData) => request('/requests', {
      method: 'POST',
      body: formData // can be FormData for file upload or plain object
    }),
    getMyRequests: () => request('/requests/my-requests'),
    getAllAdmin: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request(`/requests/admin/all${qStr}`);
    },
    getDetails: (idOrRef) => request(`/requests/${idOrRef}`),
    publicTrack: (refNo) => request(`/requests/track/${encodeURIComponent(refNo)}`),
    updateStatus: (id, updateData) => request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: updateData
    }),
    submitFeedback: (id, feedbackData) => request(`/requests/${id}/feedback`, {
      method: 'POST',
      body: feedbackData
    }),
    getExportCsvUrl: () => `${API_BASE}/requests/admin/export/csv`
  },

  // Analytics
  analytics: {
    getSummary: () => request('/analytics/summary')
  }
};
