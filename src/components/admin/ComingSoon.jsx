import { motion } from 'framer-motion'
import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ComingSoon.css'

const ComingSoon = ({ 
  title = 'Coming Soon', 
  description = 'This feature is currently under development.',
  backLink = '/admin/dashboard',
  backText = 'Back to Dashboard'
}) => {
  return (
    <div className="coming-soon">
      <motion.div
        className="coming-soon-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="coming-soon-icon">
          <Construction size={64} />
        </div>
        
        <h1>{title}</h1>
        <p>{description}</p>
        
        <Link to={backLink} className="back-button">
          <ArrowLeft size={20} />
          {backText}
        </Link>
      </motion.div>
    </div>
  )
}

export default ComingSoon