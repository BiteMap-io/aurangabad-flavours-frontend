import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Admin token takes priority, fall back to user token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // You might want to redirect to login or trigger a logout event here
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
