import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import './Footer.css'

const Footer = () => {
  const { language, t } = useLanguage()

  return (
    <footer className="footer">
      <div className="footer-separator" />
      
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <h3>Aurangabad Flavors Guide</h3>
            <p className="footer-tagline">
              Your trusted guide to the best dining experiences in Aurangabad
            </p>
            <p className="footer-institution">
              Curated by <strong>Institute of Hotel Management</strong>
              <br />
              MGM University, Aurangabad
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-column">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/explore">Restaurants</Link></li>
                <li><Link to="/map">Map View</Link></li>
                <li><Link to="/top-picks">Top Picks</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Discover</h4>
              <ul>
                <li><Link to="/cuisines">Cuisines</Link></li>
                <li><Link to="/food-culture">Food Culture</Link></li>
                <li><Link to="/events">Events</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Information</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Use</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2024 Aurangabad Flavors Guide. All rights reserved.
          </p>
          <div className="footer-language">
            <Globe size={14} />
            <span>{language.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


