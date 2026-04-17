import { motion } from 'framer-motion'
import { BookOpen, Utensils, Users } from 'lucide-react'
import { getPageContent } from '../hooks/usePageContent'

const ICONS = [<BookOpen size={32} />, <Utensils size={32} />, <Users size={32} />]

const FoodCulture = () => {
  const c = getPageContent('foodculture')

  const sections = [
    { title: c.section1Title, content: c.section1Content },
    { title: c.section2Title, content: c.section2Content },
    { title: c.section3Title, content: c.section3Content },
  ]

  const highlights = [
    { title: c.highlight1Title, content: c.highlight1Content },
    { title: c.highlight2Title, content: c.highlight2Content },
    { title: c.highlight3Title, content: c.highlight3Content },
  ]

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[50vh] flex items-center justify-center py-xl px-lg mb-xl overflow-hidden bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat max-md:py-lg max-md:px-md max-md:min-h-[40vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-[1]" />
        <div className="relative z-[2] text-center max-w-[800px]">
          <motion.h1 className="text-[3.5rem] font-bold mb-md text-white drop-shadow-lg leading-[1.2] max-md:text-[2.5rem]"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {c.heroTitle}
          </motion.h1>
          <motion.p className="text-[1.25rem] text-white/95 drop-shadow-md opacity-95 max-md:text-[1.1rem]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {c.heroSubtitle}
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-lg max-md:px-md">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] max-md:grid-cols-1 gap-xl mb-xl">
          {sections.map((s, i) => (
            <motion.div key={i}
              className="p-xl bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-[1.5rem] text-center transition-all duration-300 hover:bg-glass-hover hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ scale: 1.02, y: -4 }}>
              <div className="flex justify-center mb-md text-accent-purple">{ICONS[i]}</div>
              <h2 className="text-[1.5rem] mb-md text-primary font-semibold">{s.title}</h2>
              <p className="text-secondary leading-[1.8] m-0">{s.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-xl p-xl bg-glass-surface border border-glass-border rounded-[1.5rem] mb-xl">
          <h2 className="text-[2rem] mb-lg text-primary text-center font-semibold">Cultural Highlights</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-lg">
            {highlights.map((h, i) => (
              <div key={i} className="p-md bg-glass-surface border border-glass-border rounded-md">
                <h3 className="text-[1.25rem] mb-sm text-primary font-medium">{h.title}</h3>
                <p className="text-secondary leading-[1.6] m-0">{h.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodCulture
