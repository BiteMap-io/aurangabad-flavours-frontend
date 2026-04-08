import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

const Contact = () => {
  return (
    <motion.div
      className="min-h-screen py-xl px-lg bg-background-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-xl">
          <h1 className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-md bg-gradient-to-br from-primary via-accent-purple to-secondary bg-clip-text text-transparent">
            Contact & Help
          </h1>
          <p className="text-[1.2rem] text-secondary max-w-[600px] mx-auto">
            Get in touch with us for any queries about Aurangabad's culinary scene
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg md:gap-xl mt-xl">
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-lg md:p-xl shadow-glass flex flex-col gap-lg">
            <div className="flex items-start gap-md">
              <Mail size={24} className="text-accent-purple shrink-0 mt-[2px]" />
              <div>
                <h3 className="text-[1.1rem] text-primary mb-xs font-semibold">Email</h3>
                <p className="text-secondary text-[0.95rem]">info@aurangabadflavors.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-md">
              <Phone size={24} className="text-accent-purple shrink-0 mt-[2px]" />
              <div>
                <h3 className="text-[1.1rem] text-primary mb-xs font-semibold">Phone</h3>
                <p className="text-secondary text-[0.95rem]">+91 240 123 4567</p>
              </div>
            </div>
            
            <div className="flex items-start gap-md">
              <MapPin size={24} className="text-accent-purple shrink-0 mt-[2px]" />
              <div>
                <h3 className="text-[1.1rem] text-primary mb-xs font-semibold">Location</h3>
                <p className="text-secondary text-[0.95rem]">Aurangabad, Maharashtra, India</p>
              </div>
            </div>
            
            <div className="flex items-start gap-md">
              <Clock size={24} className="text-accent-purple shrink-0 mt-[2px]" />
              <div>
                <h3 className="text-[1.1rem] text-primary mb-xs font-semibold">Support Hours</h3>
                <p className="text-secondary text-[0.95rem]">Mon - Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="bg-glass-surface backdrop-blur-[20px] border border-glass-border rounded-lg p-lg md:p-xl shadow-glass">
            <h2 className="text-[1.5rem] text-primary mb-lg font-semibold">Frequently Asked Questions</h2>
            <div className="mb-lg pb-lg border-b border-glass-border last:border-b-0 last:mb-0 last:pb-0">
              <h3 className="text-[1rem] text-primary mb-sm font-semibold">How do I find restaurants near me?</h3>
              <p className="text-secondary leading-[1.6] text-[0.95rem]">Use the "Near Me" button in the top navigation to discover restaurants based on your location.</p>
            </div>
            <div className="mb-lg pb-lg border-b border-glass-border last:border-b-0 last:mb-0 last:pb-0">
              <h3 className="text-[1rem] text-primary mb-sm font-semibold">Can I suggest a restaurant?</h3>
              <p className="text-secondary leading-[1.6] text-[0.95rem]">Yes! Send us an email with restaurant details and we'll review it for inclusion in our guide.</p>
            </div>
            <div className="mb-lg pb-lg border-b border-glass-border last:border-b-0 last:mb-0 last:pb-0">
              <h3 className="text-[1rem] text-primary mb-sm font-semibold">Are the restaurant timings accurate?</h3>
              <p className="text-secondary leading-[1.6] text-[0.95rem]">We strive to keep all information updated, but we recommend calling ahead to confirm timings.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Contact