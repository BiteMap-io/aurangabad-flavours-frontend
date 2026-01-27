import { motion } from 'framer-motion'
import './Lanyard.css'

const Lanyard = () => {
  return (
    <div className="lanyard-container">
      {/* Hook/Connector */}
      <div className="lanyard-hook" />
      
      {/* Black Ribbon/Strap */}
      <motion.div 
        className="lanyard-ribbon"
        animate={{
          rotate: [-0.5, 0.5, -0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Hanging Card */}
      <motion.div 
        className="lanyard-card"
        animate={{
          rotate: [-1, 1, -1],
          y: [0, 2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="lanyard-text">FOOD GUIDE</span>
      </motion.div>
    </div>
  )
}

export default Lanyard
