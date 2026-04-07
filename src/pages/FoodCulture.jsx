import { motion } from 'framer-motion'
import { BookOpen, Utensils, Users } from 'lucide-react'

const FoodCulture = () => {
  const cultureSections = [
    {
      id: 1,
      title: 'Aurangabad\'s Culinary Heritage',
      icon: <BookOpen size={32} />,
      content: 'Aurangabad, with its rich history and diverse population, boasts a unique culinary landscape that blends traditional Marathi flavors with influences from across India and the world. The city\'s food culture reflects its status as a historical and cultural hub.',
    },
    {
      id: 2,
      title: 'Traditional Dishes',
      icon: <Utensils size={32} />,
      content: 'From the spicy Misal Pav to the sweet Puran Poli, Aurangabad offers a wide array of traditional Maharashtrian dishes. The city is also known for its unique take on Mughlai cuisine, reflecting its historical connections.',
    },
    {
      id: 3,
      title: 'Modern Food Scene',
      icon: <Users size={32} />,
      content: 'Today, Aurangabad\'s food scene is a vibrant mix of traditional eateries and modern restaurants. The city welcomes food lovers with everything from street food stalls to fine dining establishments, each contributing to the rich tapestry of local cuisine.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-xl px-lg mb-xl overflow-hidden bg-[#2c1810] bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat filter brightness-[1.15] contrast-[1.1] saturate-[1.08] max-md:py-lg max-md:px-md max-md:bg-top max-md:min-h-[40vh] max-md:brightness-[1.08] max-md:contrast-[1.05] max-md:saturate-[1.03] data-[theme=light]:brightness-[1.15] data-[theme=light]:contrast-[1.1] data-[theme=light]:saturate-[1.08]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.6)_100%)] z-[1] max-md:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.5)_100%)] data-[theme=light]:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.6)_100%)]" />
        <div className="relative z-[2] text-center max-w-[800px]">
          <motion.h1
            className="text-[3.5rem] font-bold mb-md text-primary [text-shadow:0_3px_12px_rgba(0,0,0,0.8),_0_1px_4px_rgba(0,0,0,0.6)] leading-[1.2] max-md:text-[2.5rem] data-[theme=light]:text-[#F8FAFC]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Aurangabad Food Culture
          </motion.h1>
          <motion.p
            className="text-[1.25rem] text-primary [text-shadow:0_2px_8px_rgba(0,0,0,0.8),_0_1px_3px_rgba(0,0,0,0.6)] opacity-95 max-md:text-[1.1rem] data-[theme=light]:text-[#F8FAFC]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore the rich culinary heritage and traditions of Aurangabad
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-lg max-md:px-md">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] max-md:grid-cols-1 gap-xl mb-xl">
          {cultureSections.map((section, index) => (
            <motion.div
              key={section.id}
              className="p-xl bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-[1.5rem] text-center transition-all duration-300 hover:bg-glass-hover hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="flex justify-center mb-md text-accent-purple">{section.icon}</div>
              <h2 className="text-[1.5rem] mb-md text-primary font-semibold">{section.title}</h2>
              <p className="text-secondary leading-[1.8] m-0">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-xl p-xl bg-glass-surface border border-glass-border rounded-[1.5rem] mb-xl">
          <h2 className="text-[2rem] mb-lg text-primary text-center font-semibold">Cultural Highlights</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-lg">
            <div className="p-md bg-glass-surface border border-glass-border rounded-md">
              <h3 className="text-[1.25rem] mb-sm text-primary font-medium">Festival Foods</h3>
              <p className="text-secondary leading-[1.6] m-0">Special dishes prepared during festivals like Ganesh Chaturthi, Diwali, and Eid showcase the city's diverse cultural celebrations.</p>
            </div>
            <div className="p-md bg-glass-surface border border-glass-border rounded-md">
              <h3 className="text-[1.25rem] mb-sm text-primary font-medium">Street Food Culture</h3>
              <p className="text-secondary leading-[1.6] m-0">Aurangabad's streets come alive with vendors offering everything from Vada Pav to Bhel Puri, creating a vibrant food culture.</p>
            </div>
            <div className="p-md bg-glass-surface border border-glass-border rounded-md">
              <h3 className="text-[1.25rem] mb-sm text-primary font-medium">Restaurant Evolution</h3>
              <p className="text-secondary leading-[1.6] m-0">The city has seen a transformation in its dining scene, with new restaurants bringing global cuisines while preserving local traditions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodCulture
