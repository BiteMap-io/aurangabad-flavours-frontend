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
 *   Dishes        GET/POST /v1/dishes              | GET/PUT/DELETE /v1/dishes/:id
 *   Food Trails   GET/POST /v1/food-trails         | GET/PUT/DELETE /v1/food-trails/:id
 *   Gallery       GET      /v1/gallery?tag=...      | POST /v1/gallery (multipart, field: 'image') | DELETE /v1/gallery/:id
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

// Build the multipart body shared by restaurant create/update.
//   hotelData.gallery         → array that may mix kept S3 URL strings and newly-added File objects
//   hotelData.menuItems       → array of { name, category, price, isVeg } (JSON; only used when no
//                               menu spreadsheet is uploaded — the file wins server-side)
const buildHotelFormData = (hotelData, menuFile) => {
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
    } else if (key === 'gallery' && Array.isArray(val)) {
      // New File objects upload as binary; kept URL strings are retained via existingGallery.
      const keep = [];
      val.forEach(g => {
        if (g instanceof File) formData.append('gallery', g);
        else if (typeof g === 'string' && g) keep.push(g);
      });
      formData.append('existingGallery', JSON.stringify(keep));
    } else if (key === 'menuItems' && Array.isArray(val)) {
      if (!menuFile) formData.append('menuItems', JSON.stringify(val));
    } else if (NESTED.includes(key) && typeof val === 'object') {
      formData.append(key, JSON.stringify(val));
    } else {
      formData.append(key, val);
    }
  });
  if (menuFile) formData.append('menu', menuFile);
  return formData;
};

export const hotelsApi = {
  // status: undefined (public/approved), 'pending' | 'approved' | 'rejected' | 'all' (admin only)
  async getAll(status) {
    const url = status ? `/restaurants?status=${status}` : '/restaurants';
    return await api.get(url);
  },

  async getById(id) {
    return await api.get(`/restaurants/${id}`);
  },

  // Every restaurant owned by the authenticated restaurant_owner, any approval status.
  async getMine() {
    return await api.get('/restaurants/mine');
  },

  async create(hotelData, menuFile = null) {
    return await api.post('/restaurants', buildHotelFormData(hotelData, menuFile), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async update(id, hotelData, menuFile = null) {
    return await api.put(`/restaurants/${id}`, buildHotelFormData(hotelData, menuFile), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async delete(id) {
    return await api.delete(`/restaurants/${id}`);
  },

  async toggleFeatured(id) {
    return await api.patch(`/restaurants/${id}/toggle-featured`);
  },

  async approve(id) {
    return await api.patch(`/restaurants/${id}/approve`);
  },

  async reject(id, reason = '') {
    return await api.patch(`/restaurants/${id}/reject`, { reason });
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

// ─── Dishes ─────────────────────────────────────────────────────────────────
// Pure JSON CRUD (no upload pipeline — `image` is a URL string).
// Backend model required fields: name, image, category, restaurantId
// GET/POST /v1/dishes | GET/PUT/DELETE /v1/dishes/:id  (mutations are admin-only)
// Note: there is no "by restaurant" endpoint — fetch all and filter on restaurantId.

export const dishesApi = {
  async getAll() {
    return await api.get('/dishes');
  },

  async getById(id) {
    return await api.get(`/dishes/${id}`);
  },

  async getByRestaurant(restaurantId) {
    return await api.get(`/dishes?restaurantId=${restaurantId}`);
  },

  async create(dishData) {
    return await api.post('/dishes', dishData);
  },

  async update(id, dishData) {
    return await api.put(`/dishes/${id}`, dishData);
  },

  async delete(id) {
    return await api.delete(`/dishes/${id}`);
  }
};

// ─── Food Trails ────────────────────────────────────────────────────────────
// Pure JSON CRUD. Backend model required fields:
//   name, description, icon, color, estimatedTime + restaurantsId[] / highlights[]
// GET/POST /v1/food-trails | GET/PUT/DELETE /v1/food-trails/:id  (mutations admin-only)

export const foodTrailsApi = {
  async getAll() {
    return await api.get('/food-trails');
  },

  async getById(id) {
    return await api.get(`/food-trails/${id}`);
  },

  async create(trailData) {
    return await api.post('/food-trails', trailData);
  },

  async update(id, trailData) {
    return await api.put(`/food-trails/${id}`, trailData);
  },

  async delete(id) {
    return await api.delete(`/food-trails/${id}`);
  }
};

// ─── Offers ─────────────────────────────────────────────────────────────────
// Restaurant-owner-managed discounts. GET is public; mutations are scoped
// server-side to admins or the restaurant's own owner.
// tiers: [{ minSpend, discountPercent }]  audience: 'all' | 'student'

export const offersApi = {
  async getByRestaurant(restaurantId) {
    return await api.get(`/offers?restaurantId=${restaurantId}`);
  },

  async getById(id) {
    return await api.get(`/offers/${id}`);
  },

  async create(offerData) {
    return await api.post('/offers', offerData);
  },

  async update(id, offerData) {
    return await api.put(`/offers/${id}`, offerData);
  },

  async delete(id) {
    return await api.delete(`/offers/${id}`);
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