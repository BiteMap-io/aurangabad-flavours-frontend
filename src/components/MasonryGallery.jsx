import { motion } from 'framer-motion'

const foodImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop&q=80',
    alt: 'Pizza',
    span: 'lg:row-span-2'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop&q=80',
    alt: 'Biryani',
    span: 'lg:col-span-2'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop&q=80',
    alt: 'Pancakes',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=400&fit=crop&q=80',
    alt: 'Indian Street Food',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=600&fit=crop&q=80',
    alt: 'South Indian',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=800&fit=crop&q=80',
    alt: 'Dessert',
    span: 'lg:row-span-2'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
    alt: 'Burger',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=600&fit=crop&q=80',
    alt: 'Ramen',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&q=80',
    alt: 'Gourmet Dish',
    span: 'lg:col-span-2'
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop&q=80',
    alt: 'Cake',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=600&fit=crop&q=80',
    alt: 'Kebab',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80',
    alt: 'Pasta',
    span: 'col-span-1 row-span-1'
  }
]

const MasonryGallery = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[150px] md:auto-rows-[140px] lg:auto-rows-[120px] gap-[0.375rem] lg:gap-xs h-full">
      {foodImages.map((image, index) => (
        <motion.div
          key={image.id}
          className={`relative rounded-md overflow-hidden cursor-default transition-all duration-300 group hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] ${image.span}`}
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
            className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-50" />
        </motion.div>
      ))}
    </div>
  )
}

export default MasonryGallery
