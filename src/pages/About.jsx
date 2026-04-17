import { motion } from 'framer-motion'
import { getPageContent } from '../hooks/usePageContent'

const About = () => {
  const c = getPageContent('about')

  return (
    <motion.div className="min-h-screen py-xl px-lg bg-background-primary"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-xl">
          <h1 className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-md bg-gradient-to-br from-primary via-accent-purple to-secondary bg-clip-text text-transparent">
            {c.title}
          </h1>
          <p className="text-[1.2rem] text-secondary max-w-[600px] mx-auto">{c.subtitle}</p>
        </div>
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
