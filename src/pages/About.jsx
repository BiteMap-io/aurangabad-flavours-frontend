import { motion } from 'framer-motion'
import { Award, Code2, GraduationCap, MapPin, HeartHandshake } from 'lucide-react'
import { getPageContent } from '../hooks/usePageContent'
import useSEO from '../hooks/useSEO'

const About = () => {
  const c = getPageContent('about')
  useSEO({
    title: 'About Us',
    description: 'Learn about the Aurangabad Flavors Guide, curated by the Institute of Hotel Management and School of Engineering & Technology at MGM University.',
    url: '/about',
  })

  return (
    <motion.div className="min-h-screen py-xl px-sm md:px-lg bg-background-primary"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[0.8rem] font-semibold mb-3">
            <HeartHandshake size={14} />
            Joint Initiative · MGM University
          </div>
          <h1 className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-md bg-gradient-to-br from-primary via-accent-purple to-secondary bg-clip-text text-transparent">
            {c.title}
          </h1>
          <p className="text-[1.2rem] text-secondary max-w-[700px] mx-auto leading-relaxed">{c.subtitle}</p>
        </div>

        {/* Institutional Collaboration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg md:gap-xl mb-xl">
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border hover:border-accent-purple/30 transition-all rounded-2xl p-lg md:p-xl shadow-glass flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center text-accent-purple mb-4">
                <Award size={24} />
              </div>
              <span className="text-[0.7rem] uppercase tracking-wider font-bold text-accent-purple block mb-1">
                Hospitality & Culinary Curation
              </span>
              <h2 className="text-[1.4rem] text-primary mb-3 font-semibold">
                Institute of Hotel Management (IHM)
              </h2>
              <p className="text-secondary leading-relaxed text-[0.95rem]">
                Curated by hospitality veterans, culinary faculty, and students at IHM MGM University. Every featured restaurant, food trail, cuisine insight, and dish recommendation is evaluated through professional hospitality standards and local culinary heritage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-tertiary text-[0.82rem]">
              <MapPin size={13} className="text-accent-purple" />
              MGM University, Chhatrapati Sambhajinagar
            </div>
          </div>

          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border hover:border-accent-purple/30 transition-all rounded-2xl p-lg md:p-xl shadow-glass flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center text-accent-purple mb-4">
                <Code2 size={24} />
              </div>
              <span className="text-[0.7rem] uppercase tracking-wider font-bold text-accent-purple block mb-1">
                Digital & Technical Curation
              </span>
              <h2 className="text-[1.4rem] text-primary mb-3 font-semibold">
                School of Engineering & Technology (SOET)
              </h2>
              <p className="text-secondary leading-relaxed text-[0.95rem]">
                Curated in collaboration with the School of Engineering & Technology (SOET), MGM University. Bringing technological expertise, interactive map curation, and digital platform design to showcase the culinary excellence of the region.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-tertiary text-[0.82rem]">
              <GraduationCap size={13} className="text-accent-purple" />
              School of Engineering and Technology, MGM University
            </div>
          </div>
        </div>

        {/* Dynamic content sections */}
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-lg md:gap-xl mt-xl">
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-lg md:p-xl shadow-glass">
            <h2 className="text-[1.5rem] text-primary mb-md font-semibold">{c.section1Title}</h2>
            <p className="text-secondary leading-[1.6] text-[1rem]">{c.section1Content}</p>
          </div>
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-lg md:p-xl shadow-glass">
            <h2 className="text-[1.5rem] text-primary mb-md font-semibold">{c.section2Title}</h2>
            <p className="text-secondary leading-[1.6] text-[1rem]">{c.section2Content}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default About
