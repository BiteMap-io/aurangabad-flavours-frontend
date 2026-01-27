import { motion } from 'framer-motion'
import './MasonryGallery.css'

const foodImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop&q=80',
    alt: 'Pizza',
    span: 'tall'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop&q=80',
    alt: 'Biryani',
    span: 'wide'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop&q=80',
    alt: 'Pancakes',
    span: 'square'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=400&fit=crop&q=80',
    alt: 'Indian Street Food',
    span: 'square'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=600&fit=crop&q=80',
    alt: 'South Indian',
    span: 'square'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=800&fit=crop&q=80',
    alt: 'Dessert',
    span: 'tall'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    alt: 'Burger',
    span: 'square'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=600&fit=crop&q=80',
    alt: 'Ramen',
    span: 'square'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&q=80',
    alt: 'Gourmet Dish',
    span: 'wide'
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop&q=80',
    alt: 'Cake',
    span: 'square'
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=600&fit=crop&q=80',
    alt: 'Kebab',
    span: 'square'
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80',
    alt: 'Pasta',
    span: 'square'
  }
]

const MasonryGallery = () => {
  return (
    <div className="masonry-gallery">
      {foodImages.map((image, index) => (
        <motion.div
          key={image.id}
          className={`masonry-item ${image.span}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.05,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.03,
            zIndex: 10,
            transition: { duration: 0.2 }
          }}
        >
          <img 
            src={image.url} 
            alt={image.alt}
            loading="lazy"
          />
          <div className="masonry-overlay" />
        </motion.div>
      ))}
    </div>
  )
}

export default MasonryGallery
