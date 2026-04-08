import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, X } from 'lucide-react'
import { eventsApi } from '../services/adminApi'

const Events = () => {
  const [selectedImage, setSelectedImage] = useState(null)
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
    <div className="min-h-screen py-xl px-lg max-w-[1400px] mx-auto">
      <div className="text-center mb-xl">
        <h1 className="text-[3rem] mb-sm text-primary font-bold">Events & Specials</h1>
        <p className="text-[1.1rem] text-secondary">Discover food festivals, special events, and culinary experiences</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] max-md:grid-cols-1 gap-xl">
        {loading ? (
          <div className="text-secondary py-xl text-center">Loading festivals...</div>
        ) : (
          events.length > 0 ? (
            events.map((event, index) => (
              <motion.div
                key={event._id || event.id}
                className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:bg-glass-hover hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setSelectedImage(event)}
              >
                <div className="w-full h-[250px] overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-lg">
                  <h2 className="text-[1.5rem] mb-md text-primary font-semibold">{event.title}</h2>
                  <div className="flex flex-col gap-xs mb-md">
                    <div className="flex items-center gap-xs text-secondary text-[0.95rem]">
                      <Calendar size={18} />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-xs text-secondary text-[0.95rem]">
                      <MapPin size={18} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-secondary leading-[1.6] m-0">{event.description}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-secondary py-xl text-center col-span-full">No upcoming events found.</div>
          )
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] max-md:max-w-[95vw] max-md:max-h-[95vh] bg-glass-surface border border-glass-border rounded-lg overflow-hidden flex flex-col"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-md right-md bg-black/70 border-none rounded-full w-[40px] h-[40px] flex items-center justify-center text-white cursor-pointer z-10 transition-colors duration-300 hover:bg-black/90" 
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} />
              </button>

              <div className="flex-1 flex items-center justify-center min-h-[400px] bg-black/50">
                <img src={selectedImage.image} alt={selectedImage.title} className="max-w-full max-h-[70vh] object-contain" />
              </div>
              
              <div className="p-lg bg-glass-surface border-t border-glass-border">
                <div className="flex flex-col gap-2 mb-4">
                  <h3 className="text-[1.5rem] text-primary mb-sm font-semibold m-0">{selectedImage.title}</h3>
                  <div className="flex gap-lg flex-wrap">
                    <div className="flex items-center gap-xs text-secondary text-[0.95rem]">
                      <Calendar size={16} />
                      <span>{selectedImage.date}</span>
                    </div>
                    <div className="flex items-center gap-xs text-secondary text-[0.95rem]">
                      <MapPin size={16} />
                      <span>{selectedImage.location}</span>
                    </div>
                  </div>
                </div>
                <p className="text-secondary m-0 leading-[1.6]">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Events
