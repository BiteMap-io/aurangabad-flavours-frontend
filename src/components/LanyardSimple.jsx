import { motion } from 'framer-motion'
import './LanyardSimple.css'

const LanyardSimple = () => {
  return (
    <div className="lanyard-simple-container">
      {/* Hook/Connector */}
      <div className="lanyard-simple-hook" />
      
      {/* Black Ribbon/Strap with subtle animation */}
      <motion.div 
        className="lanyard-simple-ribbon"
        animate={{
          rotateZ: [-1, 1, -1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Hanging Card with text */}
      <motion.div 
        className="lanyard-simple-card"
        animate={{
          rotateZ: [-2, 2, -2],
          y: [0, 3, 0]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="lanyard-card-content">
          <span className="lanyard-card-text">FOOD</span>
          <span className="lanyard-card-text">GUIDE</span>
        </div>
      </motion.div>
    </div>
  )
}

export default LanyardSimple
