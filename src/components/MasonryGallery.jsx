import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { galleryApi } from '../services/adminApi'

const MasonryGallery = () => {
  const [images, setImages] = useState([])

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await galleryApi.getAll('gallery')
        const data = response.data || response
        if (Array.isArray(data) && data.length > 0) {
          // Map gallery items to match expected format, assigning spans based on index
          const dynamicImages = data.slice(0, 12).map((item, index) => {
            const spans = [
              'lg:row-span-2', 'lg:col-span-2', 'col-span-1 row-span-1',
              'col-span-1 row-span-1', 'col-span-1 row-span-1', 'lg:row-span-2',
              'col-span-1 row-span-1', 'col-span-1 row-span-1', 'lg:col-span-2'
            ]
            return {
              id: item._id || item.id,
              url: item.url,
              alt: item.title,
              span: spans[index % spans.length]
            }
          })
          setImages(dynamicImages)
        }
      } catch (error) {
        // Silently fail or show empty state
      }
    }
    loadGallery()
  }, [])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[150px] md:auto-rows-[140px] lg:auto-rows-[120px] gap-[0.375rem] lg:gap-xs h-full">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          className={`relative rounded-md overflow-hidden cursor-default transition-all duration-300 group hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] ${image.span}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
          whileHover={{ scale: 1.03, zIndex: 10, transition: { duration: 0.2 } }}
        >
          <img 
            src={image.url} 
            alt={image.alt || 'Gallery image'}
            loading="lazy"
            className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-50" />
        </motion.div>
      ))}
    </div>
  )
}

export default MasonryGallery
