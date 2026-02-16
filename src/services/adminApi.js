import api from './api';

// Hotels API
export const hotelsApi = {
  async getAll() {
    return await api.get('/restaurants');
  },

  async getById(id) {
    return await api.get(`/restaurants/${id}`);
  },

  async create(hotelData) {
    // Handle multipart if image is present
    if (hotelData.image instanceof File) {
      const formData = new FormData();
      Object.keys(hotelData).forEach(key => {
        if (key === 'location' && typeof hotelData[key] === 'object') {
          formData.append('location[coordinates]', JSON.stringify(hotelData[key].coordinates));
        } else {
          formData.append(key, hotelData[key]);
        }
      });
      return await api.post('/restaurants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return await api.post('/restaurants', hotelData);
  },

  async update(id, hotelData) {
    if (hotelData.image instanceof File) {
      const formData = new FormData();
      Object.keys(hotelData).forEach(key => {
        formData.append(key, hotelData[key]);
      });
      return await api.put(`/restaurants/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return await api.put(`/restaurants/${id}`, hotelData);
  },

  async delete(id) {
    return await api.delete(`/restaurants/${id}`);
  },

  async toggleFeatured(id) {
    return await api.patch(`/restaurants/${id}/toggle-featured`);
  }
};

// Events API
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

// Articles API
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
  }
};

// Settings API
export const settingsApi = {
  async get() {
    return await api.get('/settings');
  },

  async update(settingsData) {
    return await api.put('/settings', settingsData);
  }
};

// Media API
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

// Dashboard stats API
export const dashboardApi = {
  async getStats() {
    return await api.get('/admin/stats');
  },

  async getRecentActivity() {
    return await api.get('/admin/recent-activity');
  }
};