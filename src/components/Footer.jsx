import { Link } from 'react-router-dom'
import { Globe, Github, Instagram, Facebook, Linkedin, MapPin, Award, ArrowRight, Store } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { motion } from 'framer-motion'

// #4 — refined link with cleaner translateX and brighter base
const NavLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="group relative text-secondary/75 no-underline transition-all duration-[250ms] text-[0.875rem] font-medium inline-flex items-center py-[0.15rem] hover:text-accent-purple focus-visible:outline-2 focus-visible:outline-accent-purple focus-visible:outline-offset-2"
    >
      <span className="transition-transform duration-[250ms] group-hover:translate-x-[4px]">{children}</span>
      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent-purple/40 transition-all duration-[250ms] group-hover:w-full rounded-full" />
    </Link>
  </li>
)

const ExternalLink = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="group relative text-secondary/75 no-underline transition-all duration-[250ms] text-[0.875rem] font-medium inline-flex items-center py-[0.15rem] hover:text-accent-purple focus-visible:outline-2 focus-visible:outline-accent-purple focus-visible:outline-offset-2"
    >
      <span className="transition-transform duration-[250ms] group-hover:translate-x-[4px]">{children}</span>
      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent-purple/40 transition-all duration-[250ms] group-hover:w-full rounded-full" />
    </a>
  </li>
)

// #6 — social with tighter spacing, scale 1.08 hover
const SocialBtn = ({ href, label, icon: Icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-8 h-8 flex items-center justify-center rounded-full bg-glass-surface border border-glass-border text-secondary/60 transition-all duration-[250ms] hover:text-accent-purple hover:border-accent-purple/45 hover:shadow-[0_0_12px_rgba(124,58,237,0.25)] focus-visible:outline-2 focus-visible:outline-accent-purple focus-visible:outline-offset-2"
    whileHover={{ scale: 1.08, y: -2 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon size={15} />
  </motion.a>
)

const Footer = () => {
  const { language } = useLanguage()

  return (
    // #11 — fade in on viewport entry
    <motion.footer
      className="relative mt-xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* #8 — ambient glow: left-anchored behind brand section + subtle center glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[420px] h-[320px] bg-accent-purple/[0.05] rounded-full blur-[90px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[160px] bg-accent-purple/[0.04] rounded-full blur-[70px]" />
      </div>

      {/* #7 — premium double-line gradient divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent-purple/35 to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent mt-[1px]" />

      <div
        className="relative z-10 bg-gradient-to-b from-background-primary via-background-primary to-background-secondary"
        style={{ backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(124,58,237,0.05) 0%, transparent 55%)' }}
      >
        {/* #1 — reduced vertical padding (~12% less) */}
        <div className="max-w-[1400px] mx-auto pt-[2.75rem] pb-0 px-sm md:px-lg">

          {/* #2 — tighter column gap on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-[1.75rem] md:gap-[2rem] lg:gap-[2.5rem] mb-[2.25rem]">

            {/* ── Brand column ── */}
            <div className="flex flex-col gap-[1rem]">

              {/* #3 — larger title ~38px, heavier weight */}
              <div>
                <h3 className="text-[2rem] md:text-[2.25rem] font-extrabold tracking-[-0.025em] leading-[1.15] bg-gradient-to-br from-primary via-accent-purple/80 to-secondary bg-clip-text text-transparent m-0">
                  Aurangabad Flavors
                </h3>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-accent-purple/60 mt-[3px]">
                  Culinary Guide
                </p>
              </div>

              {/* #3 — better line height on description */}
              <p className="text-secondary/65 text-[0.875rem] leading-[1.8] m-0 max-w-[260px]">
                Your trusted guide to the best dining experiences in Aurangabad — curated with passion and expertise.
              </p>

              {/* IHM Card — unchanged structure, tightened padding */}
              <motion.div
                className="relative rounded-[0.875rem] p-[0.875rem_1.1rem] bg-glass-surface backdrop-blur-[12px] border border-accent-purple/20 shadow-[0_4px_20px_rgba(124,58,237,0.09),inset_0_1px_0_rgba(255,255,255,0.04)] cursor-default"
                whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(124,58,237,0.16), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                transition={{ duration: 0.22 }}
              >
                <div className="absolute top-0 left-[18%] right-[18%] h-[1px] bg-gradient-to-r from-transparent via-accent-purple/45 to-transparent rounded-full" />
                <div className="flex items-start gap-[0.7rem]">
                  <div className="w-7 h-7 rounded-md bg-accent-purple/15 border border-accent-purple/25 flex items-center justify-center shrink-0 mt-[1px]">
                    <Award size={13} className="text-accent-purple" />
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold text-accent-purple/75 uppercase tracking-[0.1em] m-0 mb-[2px]">Curated by</p>
                    <p className="text-primary text-[0.85rem] font-semibold m-0 leading-[1.4]">Institute of Hotel Management</p>
                    <p className="text-tertiary text-[0.75rem] m-0 mt-[2px] flex items-center gap-1">
                      <MapPin size={10} className="text-accent-purple/55 shrink-0" />
                      MGM University, Aurangabad
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* #6 — social icons with gap-[0.625rem] */}
              <div className="flex items-center gap-[0.625rem]">
                <SocialBtn href="https://github.com/BiteMap-io" label="GitHub" icon={Github} />
                <SocialBtn href="#" label="Instagram" icon={Instagram} />
                <SocialBtn href="#" label="Facebook" icon={Facebook} />
                <SocialBtn href="#" label="LinkedIn" icon={Linkedin} />
              </div>
            </div>

            {/* #5 — section headings: slightly more prominent */}
            {/* ── Explore column ── */}
            <div>
              <h4 className="text-[0.7rem] font-extrabold text-accent-purple/75 uppercase tracking-[0.14em] mb-[1rem] m-0">
                Explore
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-[0.5rem]">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/explore">Restaurants</NavLink>
                <NavLink to="/map">Map View</NavLink>
                <NavLink to="/top-picks">Top Picks</NavLink>
              </ul>
            </div>

            {/* ── Discover column ── */}
            <div>
              <h4 className="text-[0.7rem] font-extrabold text-accent-purple/75 uppercase tracking-[0.14em] mb-[1rem] m-0">
                Discover
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-[0.5rem]">
                <NavLink to="/cuisines">Cuisines</NavLink>
                <NavLink to="/food-culture">Food Culture</NavLink>
                <NavLink to="/events">Events</NavLink>
                <NavLink to="/articles">Articles</NavLink>
              </ul>
            </div>

            {/* ── Information column ── */}
            <div>
              <h4 className="text-[0.7rem] font-extrabold text-accent-purple/75 uppercase tracking-[0.14em] mb-[1rem] m-0">
                Information
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-[0.5rem]">
                <NavLink to="/about">About Us</NavLink>
                <NavLink to="/contact">Contact</NavLink>
                <ExternalLink href="#privacy">Privacy Policy</ExternalLink>
                <ExternalLink href="#terms">Terms of Use</ExternalLink>
              </ul>
            </div>
          </div>

        <Link
          to="/partner"
          className="flex items-center justify-between gap-sm p-md bg-gradient-to-r from-accent-purple/15 to-accent-purple/5 border border-accent-purple/30 rounded-md no-underline transition-all duration-200 hover:border-accent-purple/60 hover:from-accent-purple/25 group"
        >
          <span className="flex items-center gap-sm min-w-0">
            <span className="w-10 h-10 rounded-md bg-accent-purple/15 flex items-center justify-center text-accent-purple shrink-0">
              <Store size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-primary font-semibold text-[0.95rem]">Own a restaurant?</span>
              <span className="block text-secondary text-[0.82rem] truncate">List it, manage dishes & menus, and run offers</span>
            </span>
          </span>
          <span className="flex items-center gap-1 text-accent-purple font-semibold text-[0.85rem] shrink-0 transition-transform duration-200 group-hover:translate-x-1">
            Partner Login <ArrowRight size={16} />
          </span>
        </Link>

        <div className="h-[1px] bg-glass-border my-lg opacity-50" />

          {/* Bottom bar — reduced py */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-[0.75rem] py-[1.1rem]">
            <p className="text-tertiary/60 text-[0.8rem] m-0 tracking-[0.01em]">
              &copy; {new Date().getFullYear()} Aurangabad Flavors Guide. All rights reserved.
            </p>
            {/* Language switcher */}
            <motion.div
              className="flex items-center gap-[0.4rem] px-[0.7rem] py-[0.3rem] bg-glass-surface border border-glass-border rounded-pill text-secondary/70 text-[0.75rem] font-semibold cursor-default transition-all duration-[250ms] hover:border-accent-purple/40 hover:text-accent-purple hover:shadow-[0_0_10px_rgba(124,58,237,0.12)] focus-visible:outline-2 focus-visible:outline-accent-purple"
              whileHover={{ scale: 1.04 }}
            >
              <Globe size={12} className="text-accent-purple/65" />
              <span>{language.toUpperCase()}</span>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
