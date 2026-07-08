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
    // Both an admin session and a customer/owner/guest session can be present in the
    // same browser at once (e.g. someone tested /admin/login earlier). Pick whichever
    // token actually matches the section of the app making the request, instead of
    // always favoring the admin token — otherwise a stale adminToken silently hijacks
    // owner-only calls like /restaurants/mine from the partner dashboard, and every
    // one of them 403s even though the user IS logged in as the right role.
    const isAdminSection = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const token = isAdminSection
      ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken'))
      : (localStorage.getItem('userToken') || localStorage.getItem('adminToken'));
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
    // Handle unauthorized errors (e.g., token expired). Clear whichever session
    // is present — an expired customer token must be purged too, not just admin.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Let the app react (e.g. AdminAuthContext / UserAuthContext) to a forced logout.
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
