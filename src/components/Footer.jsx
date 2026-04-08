import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const Footer = () => {
  const { language } = useLanguage()

  return (
    <footer className="mt-xl p-0 bg-gradient-to-b from-transparent via-background-primary via-30% to-background-secondary relative border-t border-glass-border">
      <div className="h-[1px] opacity-30 shadow-glow bg-gradient-to-r from-transparent via-accent-purple/45 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto py-lg px-md md:py-xl md:px-lg">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-lg lg:gap-xl mb-xl">
          <div>
            <h3 className="text-[1.5rem] md:text-[1.75rem] font-bold mb-sm text-primary bg-gradient-to-br from-primary via-secondary to-accent-purple bg-clip-text text-transparent light:![webkit-text-fill-color:initial] light:!bg-none">
              Aurangabad Flavors Guide
            </h3>
            <p className="text-secondary leading-[1.6] mb-md text-[0.95rem]">
              Your trusted guide to the best dining experiences in Aurangabad
            </p>
            <p className="text-secondary leading-[1.8] m-0 text-[0.9rem] p-md bg-glass-surface border-l-2 border-l-accent-purple/45 rounded-[0.5rem]">
              Curated by <strong className="text-primary font-semibold">Institute of Hotel Management</strong>
              <br />
              MGM University, Aurangabad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-lg">
            <div>
              <h4 className="text-[0.85rem] font-semibold mb-md text-primary uppercase tracking-[0.05em] opacity-80">
                Explore
              </h4>
              <ul className="list-none p-0 m-0">
                <li className="mb-xs">
                  <Link to="/" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Home</Link>
                </li>
                <li className="mb-xs">
                  <Link to="/explore" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Restaurants</Link>
                </li>
                <li className="mb-xs">
                  <Link to="/map" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Map View</Link>
                </li>
                <li className="mb-xs">
                  <Link to="/top-picks" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Top Picks</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[0.85rem] font-semibold mb-md text-primary uppercase tracking-[0.05em] opacity-80">
                Discover
              </h4>
              <ul className="list-none p-0 m-0">
                <li className="mb-xs">
                  <Link to="/cuisines" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Cuisines</Link>
                </li>
                <li className="mb-xs">
                  <Link to="/food-culture" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Food Culture</Link>
                </li>
                <li className="mb-xs">
                  <Link to="/events" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Events</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[0.85rem] font-semibold mb-md text-primary uppercase tracking-[0.05em] opacity-80">
                Information
              </h4>
              <ul className="list-none p-0 m-0">
                <li className="mb-xs">
                  <Link to="/about" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">About</Link>
                </li>
                <li className="mb-xs">
                  <Link to="/contact" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Contact</Link>
                </li>
                <li className="mb-xs">
                  <a href="#privacy" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Privacy Policy</a>
                </li>
                <li className="mb-xs">
                  <a href="#terms" className="text-secondary no-underline transition-all duration-200 text-[0.9rem] inline-block hover:text-primary hover:translate-x-1">Terms of Use</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-glass-border my-lg opacity-50" />

        <div className="flex flex-col md:flex-row justify-between items-center pb-lg gap-sm md:gap-0 text-center md:text-left">
          <p className="text-secondary text-[0.85rem] m-0 opacity-70">
            &copy; {new Date().getFullYear()} Aurangabad Flavors Guide. All rights reserved.
          </p>
          <div className="flex items-center gap-[0.375rem] px-[0.75rem] py-[0.375rem] bg-glass-surface border border-glass-border rounded-pill text-secondary text-[0.8rem] font-semibold">
            <Globe size={14} />
            <span>{language.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
