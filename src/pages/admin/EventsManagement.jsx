import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  Loader,
  Star
} from 'lucide-react'
import { eventsApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'
import './EventsManagement.css'

const EventsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, event: null })

  // Load events data
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsApi.getAll()
      if (response.success) {
        setEvents(response.data)
      } else {
        showToast.error('Error', 'Failed to load events')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'upcoming' && event.status === 'upcoming') ||
                           (filterStatus === 'featured' && event.featured)
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'date':
          return new Date(a.date) - new Date(b.date)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const handleDelete = async (event) => {
    try {
      const response = await eventsApi.delete(event.id)
      if (response.success) {
        setEvents(events.filter(e => e.id !== event.id))
        showToast.success('Success', `${event.title} has been deleted`)
      } else {
        showToast.error('Error', response.error || 'Failed to delete event')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to delete event')
    }
  }

  const toggleFeatured = async (id) => {
    try {
      const event = events.find(e => e.id === id)
      const updatedEvent = { ...event, featured: !event.featured }
      
      const response = await eventsApi.update(id, updatedEvent)
      if (response.success) {
        setEvents(events.map(e => e.id === id ? response.data : e))
        showToast.success('Success', 'Featured status updated')
      } else {
        showToast.error('Error', response.error || 'Failed to update featured status')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to update featured status')
    }
  }

  const openDeleteModal = (event) => {
    setDeleteModal({ isOpen: true, event })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, event: null })
  }

  const confirmDelete = () => {
    if (deleteModal.event) {
      handleDelete(deleteModal.event)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'green'
      case 'recurring':
        return 'blue'
      case 'past':
        return 'gray'
      default:
        return 'gray'
    }
  }

  return (
    <div className="events-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Events Management</h1>
          <p>Manage your events and activities</p>
        </div>
        <Link to="/admin/events/add" className="btn-primary">
          <Plus size={20} />
          Add New Event
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Only</option>
            <option value="featured">Featured Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="event-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="event-image">
                <img src={event.image} alt={event.title} />
                <div className="event-badges">
                  <span className={`badge status ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  {event.featured && (
                    <span className="badge featured">Featured</span>
                  )}
                </div>
              </div>

              <div className="event-content">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="event-date">
                    <Calendar size={16} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="event-details">
                  <p className="description">{event.description}</p>
                  <div className="location">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="event-actions">
                  <Link 
                    to={`/admin/events/edit/${event.id}`}
                    className="action-btn edit"
                    title="Edit Event"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    className="action-btn view"
                    title="View Event"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className={`action-btn feature ${event.featured ? 'active' : ''}`}
                    onClick={() => toggleFeatured(event.id)}
                    title="Toggle Featured"
                  >
                    <Star size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => openDeleteModal(event)}
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="empty-state">
          <div className="empty-content">
            <Calendar size={48} />
            <h3>No events found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="pagination">
          <p>Showing {filteredEvents.length} of {events.length} events</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteModal.event?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default EventsManagement