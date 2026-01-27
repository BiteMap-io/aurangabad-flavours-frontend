import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import './Contact.css'

const Contact = () => {
  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="contact-container">
        <div className="contact-hero">
          <h1>Contact & Help</h1>
          <p>Get in touch with us for any queries about Aurangabad's culinary scene</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={24} />
              <div>
                <h3>Email</h3>
                <p>info@aurangabadflavors.com</p>
              </div>
            </div>
            
            <div className="contact-item">
              <Phone size={24} />
              <div>
                <h3>Phone</h3>
                <p>+91 240 123 4567</p>
              </div>
            </div>
            
            <div className="contact-item">
              <MapPin size={24} />
              <div>
                <h3>Location</h3>
                <p>Aurangabad, Maharashtra, India</p>
              </div>
            </div>
            
            <div className="contact-item">
              <Clock size={24} />
              <div>
                <h3>Support Hours</h3>
                <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="help-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h3>How do I find restaurants near me?</h3>
              <p>Use the "Near Me" button in the top navigation to discover restaurants based on your location.</p>
            </div>
            <div className="faq-item">
              <h3>Can I suggest a restaurant?</h3>
              <p>Yes! Send us an email with restaurant details and we'll review it for inclusion in our guide.</p>
            </div>
            <div className="faq-item">
              <h3>Are the restaurant timings accurate?</h3>
              <p>We strive to keep all information updated, but we recommend calling ahead to confirm timings.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Contact