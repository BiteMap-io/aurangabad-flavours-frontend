import { motion } from 'framer-motion'
import { Clock, MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './FoodTrailCard.css'

const FoodTrailCard = ({ trail }) => {
  // Show only top 2 highlights
  const visibleHighlights = trail.highlights.slice(0, 2)
  const remainingCount = trail.highlights.length - 2

  return (
    <motion.div
      className="food-trail-card"
      style={{ '--trail-color': trail.color }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="trail-accent-line" />
      
      <div className="trail-header">
        <span className="trail-icon">{trail.icon}</span>
        <div className="trail-title-section">
          <h3 className="trail-name">{trail.name}</h3>
          <div className="trail-meta-inline">
            <span className="trail-meta-item">
              <Clock size={12} />
              {trail.estimatedTime}
            </span>
            <span className="trail-meta-divider">•</span>
            <span className="trail-meta-item">
              <MapPin size={12} />
              {trail.distance}
            </span>
          </div>
        </div>
      </div>

      <p className="trail-description">{trail.description}</p>

      <div className="trail-footer">
        <div className="trail-tags">
          {visibleHighlights.map((highlight, idx) => (
            <span key={idx} className="trail-tag">
              {highlight}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="trail-tag trail-tag-more">
              +{remainingCount} more
            </span>
          )}
        </div>

        <Link 
          to={`/explore?trail=${trail.id}`} 
          className="trail-cta"
        >
          Explore
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
}

export default FoodTrailCard
