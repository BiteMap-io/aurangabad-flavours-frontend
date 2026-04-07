import { motion } from 'framer-motion'

const LanyardSimple = () => {
  return (
    <>
      <style>
        {`
          .lanyard-simple-card-styled::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px);
            border-radius: 6px;
            pointer-events: none;
          }
          .lanyard-simple-card-styled::after {
            content: '';
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background: #D0D0C8;
            border-radius: 50%;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.5);
          }
        `}
      </style>
      <div className="fixed top-[12px] left-[20px] z-30 pointer-events-none flex flex-col items-center group max-md:hidden">
        {/* Hook/Connector */}
        <div className="w-[10px] h-[10px] bg-black rounded-full mb-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        
        {/* Black Ribbon/Strap with subtle animation */}
        <motion.div 
          className="w-[4px] h-[90px] bg-gradient-to-b from-black via-[#1a1a1a] to-black origin-top shadow-[inset_1px_0_0_rgba(255,255,255,0.1),2px_0_4px_rgba(0,0,0,0.3)]"
          animate={{ rotateZ: [-1, 1, -1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Hanging Card with text */}
        <motion.div 
          className="w-[85px] h-[55px] bg-gradient-to-br from-[#F8F8F5] to-[#F0F0EB] rounded-[6px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] origin-top -mt-[2px] border border-black/5 relative lanyard-simple-card-styled transition-[filter] duration-300 group-hover:brightness-105"
          animate={{ rotateZ: [-2, 2, -2], y: [0, 3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center justify-center gap-[2px] relative z-10">
            <span className="text-[11px] font-extrabold tracking-[1.2px] text-[#1A1A1A] text-center font-['Inter',sans-serif] leading-none [text-shadow:0_1px_0_rgba(255,255,255,0.8)]">FOOD</span>
            <span className="text-[11px] font-extrabold tracking-[1.2px] text-[#1A1A1A] text-center font-['Inter',sans-serif] leading-none [text-shadow:0_1px_0_rgba(255,255,255,0.8)]">GUIDE</span>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default LanyardSimple
