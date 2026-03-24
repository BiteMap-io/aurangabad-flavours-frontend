import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { eventsApi } from '../services/adminApi'
import './Events.css'

const Events = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll()
        const data = response.data || response
        setEvents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Events & Specials</h1>
        <p>Discover food festivals, special events, and culinary experiences</p>
      </div>

      <div className="events-grid">
        {loading ? (
          <div className="loading-spinner">Loading festivals...</div>
        ) : (
          events.length > 0 ? (
            events.map((event, index) => (
              <motion.div
                key={event._id || event.id}
                className="event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setSelectedImage(event)}
              >
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                </div>
                <div className="event-content">
                  <h2>{event.title}</h2>
                  <div className="event-meta">
                    <div className="event-meta-item">
                      <Calendar size={18} />
                      <span>{event.date}</span>
                    </div>
                    <div className="event-meta-item">
                      <MapPin size={18} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p>{event.description}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-events">No upcoming events found.</div>
          )
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="image-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedImage(null)}>
                <X size={24} />
              </button>

              <div className="modal-image">
                <img src={selectedImage.image} alt={selectedImage.title} />
              </div>
              
              <div className="modal-content">
                <div className="modal-event-header">
                  <h3>{selectedImage.title}</h3>
                  <div className="event-meta-inline">
                    <div className="event-meta-item">
                      <Calendar size={16} />
                      <span>{selectedImage.date}</span>
                    </div>
                    <div className="event-meta-item">
                      <MapPin size={16} />
                      <span>{selectedImage.location}</span>
                    </div>
                  </div>
                </div>
                <p className="modal-description">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Events


