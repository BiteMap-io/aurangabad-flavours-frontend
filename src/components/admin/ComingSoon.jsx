import { motion } from 'framer-motion'
import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const ComingSoon = ({ 
  title = 'Coming Soon', 
  description = 'This feature is currently under development.',
  backLink = '/admin/dashboard',
  backText = 'Back to Dashboard'
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-center font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <motion.div
        className="w-full max-w-[400px] p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full text-gray-500 mb-6 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10">
          <Construction size={40} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[1.5rem] font-semibold text-gray-100 m-0 mb-2 data-[theme=light]:text-gray-900">{title}</h1>
        <p className="text-[1rem] text-gray-500 leading-relaxed m-0 mb-6">{description}</p>
        
        <Link 
          to={backLink} 
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-white/5 border border-white/10 rounded-lg text-gray-100 no-underline font-medium transition-all duration-300 hover:bg-white/10 hover:border-purple-500 hover:-translate-y-[2px] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white data-[theme=light]:text-gray-900"
        >
          <ArrowLeft size={18} />
          {backText}
        </Link>
      </motion.div>
    </div>
  )
}

export default ComingSoon