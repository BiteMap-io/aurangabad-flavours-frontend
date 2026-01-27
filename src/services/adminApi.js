// Mock API service for admin operations
// In production, replace with actual API calls

import { restaurants } from '../data/restaurants'
import { articles } from '../data/articles'

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generate unique IDs
const generateId = () => Date.now() + Math.random()

// Local storage keys
const STORAGE_KEYS = {
  HOTELS: 'admin_hotels',
  EVENTS: 'admin_events', 
  ARTICLES: 'admin_articles',
  MEDIA: 'admin_media',
  SETTINGS: 'admin_settings'
}

// Initialize data if not exists
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.HOTELS)) {
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(restaurants))
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const mockEvents = [
      {
        id: 1,
        title: 'Aurangabad Food Festival 2024',
        description: 'Annual celebration of local cuisine and culture',
        date: '2024-03-15',
        location: 'Bibi Ka Maqbara Grounds',
        status: 'upcoming',
        featured: true,
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800'
      },
      {
        id: 2,
        title: 'Street Food Night Market',
        description: 'Weekly street food market with local vendors',
        date: '2024-02-20',
        location: 'Connaught Place',
        status: 'recurring',
        featured: false,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      }
    ]
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEvents))
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings = {
      siteName: 'Aurangabad Flavors',
      contactEmail: 'info@aurangabadflavors.com',
      contactPhone: '+91 240 123 4567',
      address: 'Aurangabad, Maharashtra, India',
      socialMedia: {
        facebook: 'https://facebook.com/aurangabadflavors',
        instagram: 'https://instagram.com/aurangabadflavors',
        twitter: 'https://twitter.com/aurangabadflavors'
      },
      features: {
        showWelcomeIntro: true,
        showFeaturedSection: true,
        showTopPicks: true,
        enableTouristMode: true
      }
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  }
}

// Initialize data on module load
initializeData()

// Hotels API
export const hotelsApi = {
  async getAll() {
    await delay(500)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
    return { success: true, data }
  },

  async getById(id) {
    await delay(300)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
    const hotel = data.find(h => h.id === parseInt(id))
    if (hotel) {
      return { success: true, data: hotel }
    }
    return { success: false, error: 'Hotel not found' }
  },

  async create(hotelData) {
    await delay(800)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
      const newHotel = {
        ...hotelData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      data.push(newHotel)
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(data))
      return { success: true, data: newHotel }
    } catch (error) {
      return { success: false, error: 'Failed to create hotel' }
    }
  },

  async update(id, hotelData) {
    await delay(800)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
      const index = data.findIndex(h => h.id === parseInt(id))
      if (index === -1) {
        return { success: false, error: 'Hotel not found' }
      }
      
      data[index] = {
        ...data[index],
        ...hotelData,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(data))
      return { success: true, data: data[index] }
    } catch (error) {
      return { success: false, error: 'Failed to update hotel' }
    }
  },

  async delete(id) {
    await delay(500)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
      const filteredData = data.filter(h => h.id !== parseInt(id))
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(filteredData))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to delete hotel' }
    }
  },

  async toggleFeatured(id) {
    await delay(300)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
      const index = data.findIndex(h => h.id === parseInt(id))
      if (index === -1) {
        return { success: false, error: 'Hotel not found' }
      }
      
      data[index].ihmRecommended = !data[index].ihmRecommended
      data[index].updatedAt = new Date().toISOString()
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(data))
      return { success: true, data: data[index] }
    } catch (error) {
      return { success: false, error: 'Failed to toggle featured status' }
    }
  }
}

// Events API
export const eventsApi = {
  async getAll() {
    await delay(400)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
    return { success: true, data }
  },

  async getById(id) {
    await delay(300)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
    const event = data.find(e => e.id === parseInt(id))
    if (event) {
      return { success: true, data: event }
    }
    return { success: false, error: 'Event not found' }
  },

  async create(eventData) {
    await delay(600)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
      const newEvent = {
        ...eventData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      data.push(newEvent)
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data))
      return { success: true, data: newEvent }
    } catch (error) {
      return { success: false, error: 'Failed to create event' }
    }
  },

  async update(id, eventData) {
    await delay(600)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
      const index = data.findIndex(e => e.id === parseInt(id))
      if (index === -1) {
        return { success: false, error: 'Event not found' }
      }
      
      data[index] = {
        ...data[index],
        ...eventData,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data))
      return { success: true, data: data[index] }
    } catch (error) {
      return { success: false, error: 'Failed to update event' }
    }
  },

  async delete(id) {
    await delay(400)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
      const filteredData = data.filter(e => e.id !== parseInt(id))
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filteredData))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to delete event' }
    }
  }
}

// Articles API
export const articlesApi = {
  async getAll() {
    await delay(400)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]')
    return { success: true, data }
  },

  async getById(id) {
    await delay(300)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]')
    const article = data.find(a => a.id === parseInt(id))
    if (article) {
      return { success: true, data: article }
    }
    return { success: false, error: 'Article not found' }
  },

  async create(articleData) {
    await delay(700)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]')
      const newArticle = {
        ...articleData,
        id: generateId(),
        slug: articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      data.push(newArticle)
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(data))
      return { success: true, data: newArticle }
    } catch (error) {
      return { success: false, error: 'Failed to create article' }
    }
  },

  async update(id, articleData) {
    await delay(700)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]')
      const index = data.findIndex(a => a.id === parseInt(id))
      if (index === -1) {
        return { success: false, error: 'Article not found' }
      }
      
      data[index] = {
        ...data[index],
        ...articleData,
        slug: articleData.title ? articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : data[index].slug,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(data))
      return { success: true, data: data[index] }
    } catch (error) {
      return { success: false, error: 'Failed to update article' }
    }
  },

  async delete(id) {
    await delay(400)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]')
      const filteredData = data.filter(a => a.id !== parseInt(id))
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(filteredData))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to delete article' }
    }
  }
}

// Settings API
export const settingsApi = {
  async get() {
    await delay(300)
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
    return { success: true, data }
  },

  async update(settingsData) {
    await delay(500)
    try {
      const currentData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
      const updatedData = { ...currentData, ...settingsData }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedData))
      return { success: true, data: updatedData }
    } catch (error) {
      return { success: false, error: 'Failed to update settings' }
    }
  }
}

// Media API (mock)
export const mediaApi = {
  async getAll() {
    await delay(400)
    // Mock media files
    const mockMedia = [
      {
        id: 1,
        name: 'restaurant-1.jpg',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        type: 'image',
        size: '245 KB',
        uploadedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'food-festival.jpg',
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
        type: 'image',
        size: '312 KB',
        uploadedAt: '2024-01-14T15:45:00Z'
      }
    ]
    return { success: true, data: mockMedia }
  },

  async upload(file) {
    await delay(1000)
    // Mock file upload
    const mockFile = {
      id: generateId(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      size: `${Math.round(file.size / 1024)} KB`,
      uploadedAt: new Date().toISOString()
    }
    return { success: true, data: mockFile }
  },

  async delete(id) {
    await delay(300)
    return { success: true }
  }
}

// Dashboard stats API
export const dashboardApi = {
  async getStats() {
    await delay(400)
    try {
      const hotels = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTELS) || '[]')
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
      const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]')
      
      const stats = {
        totalHotels: hotels.length,
        activeEvents: events.filter(e => e.status === 'upcoming' || e.status === 'recurring').length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        monthlyViews: '12.5K' // Mock data
      }
      
      return { success: true, data: stats }
    } catch (error) {
      return { success: false, error: 'Failed to fetch stats' }
    }
  },

  async getRecentActivity() {
    await delay(300)
    // Mock recent activity
    const activities = [
      {
        id: 1,
        type: 'hotel',
        action: 'added',
        title: 'The Royal Spice',
        time: '2 hours ago'
      },
      {
        id: 2,
        type: 'article',
        action: 'published',
        title: 'Best Street Food in Aurangabad',
        time: '4 hours ago'
      },
      {
        id: 3,
        type: 'event',
        action: 'updated',
        title: 'Food Festival 2024',
        time: '6 hours ago'
      }
    ]
    
    return { success: true, data: activities }
  }
}