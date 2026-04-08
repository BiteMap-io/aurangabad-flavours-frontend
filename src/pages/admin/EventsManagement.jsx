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
      setLoading(true);
      const response = await eventsApi.getAll();
      const data = response.data || response;
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        showToast.error('Error', 'Failed to load events');
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = (event.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'upcoming' && event.status === 'upcoming') ||
                           (filterStatus === 'featured' && event.featured)
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.name || '').localeCompare(b.name || '')
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
      const eventId = event._id || event.id
      const response = await eventsApi.delete(eventId)
      if (response.success || response) {
        setEvents(events.filter(e => (e._id || e.id) !== eventId))
        showToast.success('Success', `${event.name} has been deleted`)
      } else {
        showToast.error('Error', 'Failed to delete event')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to delete event')
    }
  }

  const toggleFeatured = async (id) => {
    try {
      // Toggle featured endpoint should exist or use update
      const targetEvent = events.find(e => (e._id || e.id) === id);
      if(!targetEvent) return;
      const response = await eventsApi.update(id, { featured: !targetEvent.featured })
      const updatedEvent = response.data || response
      if (updatedEvent) {
        setEvents(events.map(e => (e._id || e.id) === id ? updatedEvent : e))
        showToast.success('Success', 'Featured status updated')
      } else {
        showToast.error('Error', 'Failed to update featured status')
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
        return 'bg-gradient-to-br from-emerald-500 to-emerald-700'
      case 'recurring':
        return 'bg-gradient-to-br from-blue-500 to-blue-700'
      case 'past':
        return 'bg-gradient-to-br from-gray-500 to-gray-600'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 max-[480px]:text-[1.5rem] data-[theme=light]:text-gray-900">Events Management</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Manage your events and activities</p>
        </div>
        <Link to="/admin/events/add" className="inline-flex items-center gap-1.5 py-2 px-6 bg-gradient-to-br from-purple-500 to-[#9b59b6] border-none rounded-lg text-white no-underline font-semibold transition-all duration-300 hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(138,43,226,0.2)] hover:shadow-[0_8px_25px_rgba(138,43,226,0.3)]">
          <Plus size={20} />
          Add New Event
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-8 flex-wrap max-md:flex-col">
        <div className="relative flex-1 min-w-[300px] max-md:min-w-0">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          />
        </div>

        <div className="flex gap-2 max-md:flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Only</option>
            <option value="featured">Featured Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500 data-[theme=light]:text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0 text-[1rem]">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mb-8 max-md:grid-cols-1">
          {filteredEvents.map((event, index) => {
            const eventId = event._id || event.id
            return (
              <motion.div
                key={eventId}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative h-[200px] overflow-hidden">
                <img src={event.image} alt={event.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`py-1 px-2 rounded font-semibold text-[0.75rem] text-white capitalize ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  {event.featured && (
                    <span className="py-1 px-2 rounded font-semibold text-[0.75rem] text-white capitalize bg-gradient-to-br from-purple-500 to-[#9b59b6]">Featured</span>
                  )}
                </div>
              </div>

              <div className="p-6 max-[480px]:p-4">
                <div className="flex items-start justify-between mb-2 gap-2 max-md:flex-col max-md:items-start">
                  <h3 className="text-[1.1rem] font-semibold text-gray-100 m-0 flex-1 data-[theme=light]:text-gray-900 leading-[1.3] line-clamp-2">{event.name}</h3>
                  <div className="flex items-center gap-1 text-[0.85rem] text-gray-500 whitespace-nowrap">
                    <Calendar size={16} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-500 text-[0.9rem] m-0 mb-2 leading-[1.4] line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-1 text-gray-500 text-[0.85rem]">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 justify-end max-md:justify-center">
                  <Link 
                    to={`/admin/events/edit/${eventId}`}
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 cursor-pointer transition-all duration-200 no-underline hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:border-black/10 data-[theme=light]:bg-white/80"
                    title="Edit Event"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent text-gray-500 cursor-pointer transition-all duration-200 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 data-[theme=light]:border-black/10"
                    title="View Event"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className={`w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent cursor-pointer transition-all duration-200 data-[theme=light]:border-black/10 ${event.featured ? 'text-amber-500 bg-amber-500/10 border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/20' : 'text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30'}`}
                    onClick={() => toggleFeatured(eventId)}
                    title="Toggle Featured"
                  >
                    <Star size={16} className={event.featured ? 'fill-current' : ''} />
                  </button>
                  <button
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent text-gray-500 cursor-pointer transition-all duration-200 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 data-[theme=light]:border-black/10"
                    onClick={() => openDeleteModal(event)}
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="flex items-center justify-center min-h-[300px] text-center text-gray-500">
          <div>
            <Calendar size={48} className="mx-auto mb-4" />
            <h3 className="text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold">No events found</h3>
            <p className="m-0">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-center py-6 border-t border-white/10 data-[theme=light]:border-black/10 mt-4">
          <p className="text-gray-500 text-[0.9rem] m-0">Showing {filteredEvents.length} of {events.length} events</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteModal.event?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default EventsManagement