/**
 * adminApi.js
 * Frontend API service layer — aligned with AURANGABAD-FLAVOURS-BACKEND v1 routes.
 *
 * Base URL: set in VITE_API_BASE_URL (.env)
 * All protected endpoints require Bearer token (auto-attached by api.js interceptor from localStorage 'adminToken')
 *
 * Route summary:
 *   Restaurants   GET/POST /v1/restaurants         | GET/PUT/DELETE /v1/restaurants/:id | PATCH /v1/restaurants/:id/toggle-featured
 *   Events        GET/POST /v1/events              | GET/PUT/DELETE /v1/events/:id
 *   Articles      GET/POST /v1/articles            | GET/PUT/DELETE /v1/articles/:id   | PATCH /v1/articles/:id/toggle-status
 *   Media         GET      /v1/media               | POST /v1/media (multipart, field: 'file') | DELETE /v1/media/:id
 *   Settings      GET      /v1/settings            | PUT /v1/settings
 *   Admin         GET      /v1/admin/stats         | GET /v1/admin/recent-activity
 *   Auth          POST     /v1/auth/login          | POST /v1/auth/signup
 *
 * Note on Content-Type:
 *   - Restaurant POST/PUT: multipart/form-data (multer handles image upload to S3)
 *   - Media POST: multipart/form-data (field name: 'file')
 *   - Everything else: application/json
 */

import api from './api';

// ─── Restaurants ────────────────────────────────────────────────────────────
// Backend model required fields: name, establishmentType, cuisine, priceRange,
//   rating, image (S3 URL via upload), description, location.coordinates, area
// POST/PUT use multipart/form-data with image as binary field 'image'

export const hotelsApi = {
  async getAll() {
    return await api.get('/restaurants');
  },

  async getById(id) {
    return await api.get(`/restaurants/${id}`);
  },

  async create(hotelData, menuFile = null) {
    const formData = new FormData();
    const NESTED = ['extraFacilities', 'food', 'staff', 'environment'];
    Object.entries(hotelData).forEach(([key, val]) => {
      if (val === null || val === undefined) return;
      if (key === 'location') {
        formData.append('location[type]', val.type || 'Point');
        formData.append('location[coordinates][0]', String(val.coordinates[0]));
        formData.append('location[coordinates][1]', String(val.coordinates[1]));
      } else if (key === 'facilities' && Array.isArray(val)) {
        val.forEach(f => formData.append('facilities', f));
      } else if (key === 'menuItems') {
        // skip — sent via file
      } else if (NESTED.includes(key) && typeof val === 'object') {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, val);
      }
    });
    if (menuFile) formData.append('menu', menuFile);
    return await api.post('/restaurants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async update(id, hotelData, menuFile = null) {
    const formData = new FormData();
    const NESTED = ['extraFacilities', 'food', 'staff', 'environment'];
    Object.entries(hotelData).forEach(([key, val]) => {
      if (val === null || val === undefined) return;
      if (key === 'location') {
        formData.append('location[type]', val.type || 'Point');
        formData.append('location[coordinates][0]', String(val.coordinates[0]));
        formData.append('location[coordinates][1]', String(val.coordinates[1]));
      } else if (key === 'facilities' && Array.isArray(val)) {
        val.forEach(f => formData.append('facilities', f));
      } else if (key === 'menuItems') {
        // skip — sent via file
      } else if (NESTED.includes(key) && typeof val === 'object') {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, val);
      }
    });
    if (menuFile) formData.append('menu', menuFile);
    return await api.put(`/restaurants/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async delete(id) {
    return await api.delete(`/restaurants/${id}`);
  },

  async toggleFeatured(id) {
    return await api.patch(`/restaurants/${id}/toggle-featured`);
  }
};

// ─── Events ─────────────────────────────────────────────────────────────────
// Backend model required fields: name, description, date, location, image,
//   organizer, price, capacity
// All requests use application/json

export const eventsApi = {
  async getAll() {
    return await api.get('/events');
  },

  async getById(id) {
    return await api.get(`/events/${id}`);
  },

  async create(eventData) {
    return await api.post('/events', eventData);
  },

  async update(id, eventData) {
    return await api.put(`/events/${id}`, eventData);
  },

  async delete(id) {
    return await api.delete(`/events/${id}`);
  }
};

// ─── Articles ───────────────────────────────────────────────────────────────
// Backend model required fields: title, slug, excerpt, content, image,
//   author (User ObjectId), category, publishedDate, readTime (string)
// All requests use application/json

export const articlesApi = {
  async getAll() {
    return await api.get('/articles');
  },

  async getById(id) {
    return await api.get(`/articles/${id}`);
  },

  async create(articleData) {
    return await api.post('/articles', articleData);
  },

  async update(id, articleData) {
    return await api.put(`/articles/${id}`, articleData);
  },

  async delete(id) {
    return await api.delete(`/articles/${id}`);
  },

  async toggleStatus(id) {
    return await api.patch(`/articles/${id}/toggle-status`);
  },

  async getBySlug(slug) {
    return await api.get(`/articles/s/${slug}`);
  }
};

// ─── Settings ───────────────────────────────────────────────────────────────
// GET is public; PUT requires admin auth

export const settingsApi = {
  async get() {
    return await api.get('/settings');
  },

  async update(settingsData) {
    return await api.put('/settings', settingsData);
  }
};

// ─── Media ──────────────────────────────────────────────────────────────────
// GET/POST/DELETE all require admin auth
// POST uses multipart/form-data with field name 'file'

export const mediaApi = {
  async getAll() {
    return await api.get('/media');
  },

  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async delete(id) {
    return await api.delete(`/media/${id}`);
  }
};

// ─── Dashboard / Admin ──────────────────────────────────────────────────────
// Both require admin auth (Bearer token)
// GET /v1/admin/stats         → { totalRestaurants, totalEvents, totalArticles, ... }
// GET /v1/admin/recent-activity → [{ type, title, action, time, ... }]

// ─── Gallery ────────────────────────────────────────────────────────────────
// GET  /v1/gallery?tag=... → Public
// POST /v1/gallery        → Admin only, multipart/form-data
// DELETE /v1/gallery/:id  → Admin only

export const galleryApi = {
  async getAll(tag = '') {
    const url = tag ? `/gallery?tag=${tag}` : '/gallery';
    return await api.get(url);
  },

  async upload(imageData) {
    // imageData should be an object with { image (File), title, description, tags (Array or comma-sep String) }
    const formData = new FormData();
    Object.entries(imageData).forEach(([key, val]) => {
      if (val === null || val === undefined) return;
      if (key === 'tags' && Array.isArray(val)) {
        val.forEach(t => formData.append('tags', t));
      } else {
        formData.append(key, val);
      }
    });

    return await api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async delete(id) {
    return await api.delete(`/gallery/${id}`);
  }
};

export const dashboardApi = {
  async getStats() {
    return await api.get('/admin/stats');
  },

  async getRecentActivity() {
    return await api.get('/admin/recent-activity');
  }
};

// ─── Auth ───────────────────────────────────────────────────────────────────
// POST /v1/auth/login   → { token, user: { id, name, email, userType } }
// POST /v1/auth/signup  → { ... }

export const authApi = {
  async login(email, password) {
    return await api.post('/auth/login', { email, password });
  },

  async signup(name, email, password, userType = 'admin') {
    return await api.post('/auth/signup', { name, email, password, userType });
  }
};