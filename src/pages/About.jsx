import { motion } from 'framer-motion'

const About = () => {
  return (
    <motion.div
      className="min-h-screen py-xl px-lg bg-background-primary data-[theme=light]:bg-background-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-xl">
          <h1 className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-md bg-[linear-gradient(135deg,#F8FAFC_0%,#E2E8F0_50%,#CBD5E1_100%)] bg-clip-text text-transparent data-[theme=light]:text-primary data-[theme=light]:![webkit-text-fill-color:initial] data-[theme=light]:!bg-none">
            About Aurangabad
          </h1>
          <p className="text-[1.2rem] text-secondary max-w-[600px] mx-auto data-[theme=light]:text-secondary">
            Discover the rich heritage and culinary traditions of the City of Gates
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-lg md:gap-xl mt-xl">
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-lg md:p-xl shadow-glass data-[theme=light]:bg-[#ffffff] data-[theme=light]:border-[#e2e8f0]">
            <h2 className="text-[1.5rem] text-primary mb-md font-semibold data-[theme=light]:text-primary">Heritage & Culture</h2>
            <p className="text-secondary leading-[1.6] text-[1rem] data-[theme=light]:text-secondary">
              Aurangabad, known as the "City of Gates," is a magnificent blend of Mughal architecture 
              and Marathi culture. Home to the world-famous Ajanta and Ellora Caves, this historic 
              city offers an incredible journey through time.
            </p>
          </div>
          
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-lg md:p-xl shadow-glass data-[theme=light]:bg-[#ffffff] data-[theme=light]:border-[#e2e8f0]">
            <h2 className="text-[1.5rem] text-primary mb-md font-semibold data-[theme=light]:text-primary">Culinary Legacy</h2>
            <p className="text-secondary leading-[1.6] text-[1rem] data-[theme=light]:text-secondary">
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