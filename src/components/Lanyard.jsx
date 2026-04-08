import { motion } from 'framer-motion'

const Lanyard = () => {
  return (
    <div className="fixed top-[16px] left-[20px] md:top-[16px] md:left-[20px] max-md:top-[12px] max-md:left-[12px] z-[1000] pointer-events-none flex flex-col items-center">
      {/* Hook/Connector */}
      <div className="w-[8px] h-[8px] bg-black rounded-full mb-[2px]" />
      
      {/* Black Ribbon/Strap */}
      <motion.div 
        className="w-[3px] bg-black origin-top h-[60px] md:h-[80px]"
        animate={{
          rotate: [-0.5, 0.5, -0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Hanging Card */}
      <motion.div 
        className="bg-[#F5F5F0] rounded-[4px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] origin-top -mt-[2px] w-[60px] h-[38px] md:w-[70px] md:h-[45px]"
        animate={{
          rotate: [-1, 1, -1],
          y: [0, 2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="font-bold tracking-[0.5px] text-[#1A1A1A] text-center font-['Inter',sans-serif] leading-[1.2] text-[8px] md:text-[9px]">
          FOOD GUIDE
        </span>
      </motion.div>
    </div>
  )
}

export default Lanyard
