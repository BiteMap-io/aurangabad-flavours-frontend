import { motion } from 'framer-motion'
import './About.css'

const About = () => {
  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="about-container">
        <div className="about-hero">
          <h1>About Aurangabad</h1>
          <p>Discover the rich heritage and culinary traditions of the City of Gates</p>
        </div>
        
        <div className="about-content">
          <div className="about-section">
            <h2>Heritage & Culture</h2>
            <p>
              Aurangabad, known as the "City of Gates," is a magnificent blend of Mughal architecture 
              and Marathi culture. Home to the world-famous Ajanta and Ellora Caves, this historic 
              city offers an incredible journey through time.
            </p>
          </div>
          
          <div className="about-section">
            <h2>Culinary Legacy</h2>
            <p>
              The city's food culture reflects its diverse heritage, from traditional Maharashtrian 
              cuisine to Mughlai delicacies. Experience authentic flavors that have been passed down 
              through generations.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default About