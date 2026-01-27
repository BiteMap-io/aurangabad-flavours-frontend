import { motion } from 'framer-motion'
import { BookOpen, Utensils, Users } from 'lucide-react'
import './FoodCulture.css'

const FoodCulture = () => {
  const cultureSections = [
    {
      id: 1,
      title: 'Aurangabad\'s Culinary Heritage',
      icon: <BookOpen size={32} />,
      content: 'Aurangabad, with its rich history and diverse population, boasts a unique culinary landscape that blends traditional Marathi flavors with influences from across India and the world. The city\'s food culture reflects its status as a historical and cultural hub.',
    },
    {
      id: 2,
      title: 'Traditional Dishes',
      icon: <Utensils size={32} />,
      content: 'From the spicy Misal Pav to the sweet Puran Poli, Aurangabad offers a wide array of traditional Maharashtrian dishes. The city is also known for its unique take on Mughlai cuisine, reflecting its historical connections.',
    },
    {
      id: 3,
      title: 'Modern Food Scene',
      icon: <Users size={32} />,
      content: 'Today, Aurangabad\'s food scene is a vibrant mix of traditional eateries and modern restaurants. The city welcomes food lovers with everything from street food stalls to fine dining establishments, each contributing to the rich tapestry of local cuisine.',
    },
  ]

  return (
    <div className="food-culture-page">
      {/* Hero Section with Background */}
      <section className="food-culture-hero-section">
        <div className="food-culture-hero-overlay" />
        <div className="food-culture-header">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Aurangabad Food Culture
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore the rich culinary heritage and traditions of Aurangabad
          </motion.p>
        </div>
      </section>

      <div className="food-culture-content">
        <div className="culture-sections">
          {cultureSections.map((section, index) => (
            <motion.div
              key={section.id}
              className="culture-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="culture-icon">{section.icon}</div>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="culture-highlights">
          <h2>Cultural Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-item">
              <h3>Festival Foods</h3>
              <p>Special dishes prepared during festivals like Ganesh Chaturthi, Diwali, and Eid showcase the city\'s diverse cultural celebrations.</p>
            </div>
            <div className="highlight-item">
              <h3>Street Food Culture</h3>
              <p>Aurangabad\'s streets come alive with vendors offering everything from Vada Pav to Bhel Puri, creating a vibrant food culture.</p>
            </div>
            <div className="highlight-item">
              <h3>Restaurant Evolution</h3>
              <p>The city has seen a transformation in its dining scene, with new restaurants bringing global cuisines while preserving local traditions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodCulture


