import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageOff, X } from 'lucide-react'
import { galleryApi } from '../services/adminApi'

// Shown when a photo URL is dead, so a tile never collapses to a broken icon.
const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%25' height='100%25' fill='%231a1626'/><circle cx='200' cy='200' r='40' fill='none' stroke='%237c6f9c' stroke-width='3'/></svg>"

const onImgError = (e) => {
  if (e.currentTarget.src !== PLACEHOLDER_IMG) e.currentTarget.src = PLACEHOLDER_IMG
}

// Curated span pattern so the tiles form a varied, masonry-like grid.
const SPANS = [
  'lg:row-span-2', 'lg:col-span-2', 'col-span-1 row-span-1',
  'col-span-1 row-span-1', 'col-span-1 row-span-1', 'lg:row-span-2',
  'col-span-1 row-span-1', 'col-span-1 row-span-1', 'lg:col-span-2',
]

const MasonryGallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    let active = true

    const loadGallery = async () => {
      try {
        // Prefer photos tagged "gallery"; if there are none (common — admins
        // often upload without that exact label), fall back to ALL gallery
        // photos so the section is never empty when images exist.
        let data = []
        try {
          const tagged = await galleryApi.getAll('gallery')
          data = tagged.data || tagged || []
        } catch { data = [] }

        if (!Array.isArray(data) || data.length === 0) {
          const all = await galleryApi.getAll('')
          data = all.data || all || []
        }

        if (!active) return

        const mapped = (Array.isArray(data) ? data : [])
          .filter(item => item?.url)
          .slice(0, 9)
          .map((item, index) => ({
            id: item._id || item.id || index,
            url: item.url,
            alt: item.title || 'Gallery image',
            span: SPANS[index % SPANS.length],
          }))
        setImages(mapped)
      } catch {
        if (active) setImages([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadGallery()
    return () => { active = false }
  }, [])

  // Loading skeleton — shimmering tiles in the same grid shape.
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[150px] md:auto-rows-[140px] lg:auto-rows-[120px] gap-[0.375rem] lg:gap-xs h-full">
        {SPANS.map((span, i) => (
          <div key={i} className={`rounded-md bg-glass-surface animate-pulse ${span}`} />
        ))}
      </div>
    )
  }

  // Empty state — friendly, instead of a blank box.
  if (images.length === 0) {
    return (
      <div className="h-full min-h-[260px] flex flex-col items-center justify-center gap-2 text-tertiary text-center rounded-md border border-dashed border-glass-border">
        <ImageOff size={40} className="opacity-40" />
        <p className="text-[0.9rem] m-0">Gallery photos will appear here</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[150px] md:auto-rows-[140px] lg:auto-rows-[120px] gap-[0.375rem] lg:gap-xs h-full">
        {images.map((image, index) => (
          <motion.button
            type="button"
            key={image.id}
            onClick={() => setLightbox(image)}
            className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-300 group hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] ${image.span}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, zIndex: 10, transition: { duration: 0.2 } }}
          >
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              onError={onImgError}
              className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-50" />
            {image.alt && image.alt !== 'Gallery image' && (
              <span className="absolute bottom-1.5 left-2 right-2 text-left text-white text-[0.72rem] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate drop-shadow">
                {image.alt}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Lightbox — portaled to <body> so it covers the whole viewport, not just
          the (transformed) card the gallery sits inside. */}
      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
            >
              <button
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all z-10"
              >
                <X size={24} />
              </button>
              <motion.img
                src={lightbox.url}
                alt={lightbox.alt}
                onError={onImgError}
                onClick={(e) => e.stopPropagation()}
                className="max-w-[94vw] max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
              />
              {lightbox.alt && lightbox.alt !== 'Gallery image' && (
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-[0.9rem] font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
                  {lightbox.alt}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default MasonryGallery
