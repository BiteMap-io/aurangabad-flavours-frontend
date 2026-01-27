import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'
import './Events.css'

const Events = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const events = [
    {
      id: 1,
      title: 'Aurangabad Food Festival 2024',
      date: 'March 15-20, 2024',
      location: 'City Center',
      description: 'A week-long celebration of Aurangabad\'s diverse culinary heritage featuring local and international cuisines.',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    },
    {
      id: 2,
      title: 'Chef\'s Special Week',
      date: 'Ongoing',
      location: 'Multiple Locations',
      description: 'Exclusive chef-curated menus at participating restaurants. Limited time special dishes.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    },
    {
      id: 3,
      title: 'Street Food Tour',
      date: 'Every Saturday',
      location: 'Downtown',
      description: 'Guided tour of Aurangabad\'s best street food vendors. Experience authentic local flavors.',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800',
    },
  ]

  const pastEventsGallery = [
    {
      id: 1,
      title: 'Food Festival 2023 - Opening Ceremony',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
      description: 'Grand opening with traditional dance performances'
    },
    {
      id: 2,
      title: 'Chef Competition Finals',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
      description: 'Local chefs competing for the golden spatula'
    },
    {
      id: 3,
      title: 'Street Food Night Market',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80',
      description: 'Bustling night market with authentic street vendors'
    },
    {
      id: 4,
      title: 'Cultural Food Exchange',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
      description: 'International cuisine showcase event'
    },
    {
      id: 5,
      title: 'Traditional Cooking Workshop',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
      description: 'Hands-on cooking classes with local masters'
    },
    {
      id: 6,
      title: 'Food Photography Contest',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      description: 'Amateur photographers capturing culinary art'
    },
    {
      id: 7,
      title: 'Spice Market Tour',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
      description: 'Guided tour through historic spice markets'
    },
    {
      id: 8,
      title: 'Dessert Festival Finale',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=800&q=80',
      description: 'Sweet ending to our annual dessert celebration'
    }
  ]

  const openImageModal = (image, index) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % pastEventsGallery.length
    setCurrentImageIndex(nextIndex)
    setSelectedImage(pastEventsGallery[nextIndex])
  }

  const prevImage = () => {
    const prevIndex = currentImageIndex === 0 ? pastEventsGallery.length - 1 : currentImageIndex - 1
    setCurrentImageIndex(prevIndex)
    setSelectedImage(pastEventsGallery[prevIndex])
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Events & Specials</h1>
        <p>Discover food festivals, special events, and culinary experiences</p>
      </div>

      <div className="events-grid">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            className="event-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
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
        ))}
      </div>

      {/* Past Events Gallery Section */}
      <div className="past-events-section">
        <div className="section-header">
          <h2>Past Events Gallery</h2>
          <p>Relive the memorable moments from our previous culinary celebrations</p>
        </div>

        <div className="gallery-grid">
          {pastEventsGallery.map((item, index) => (
            <motion.div
              key={item.id}
              className="gallery-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => openImageModal(item, index)}
            >
              <div className="gallery-image">
                <img src={item.image} alt={item.title} />
                <div className="gallery-overlay">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="image-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeImageModal}>
                <X size={24} />
              </button>
              
              <button className="modal-nav modal-prev" onClick={prevImage}>
                <ChevronLeft size={24} />
              </button>
              
              <button className="modal-nav modal-next" onClick={nextImage}>
                <ChevronRight size={24} />
              </button>

              <div className="modal-image">
                <img src={selectedImage.image} alt={selectedImage.title} />
              </div>
              
              <div className="modal-content">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Events


