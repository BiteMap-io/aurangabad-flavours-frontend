import { Users } from 'lucide-react'
import { getCrowdLevelColor, getCrowdLevelLabel } from '../utils/diningUtils'

const CrowdIndicator = ({ level }) => {
  if (!level) return null

  const color = getCrowdLevelColor(level)
  const label = getCrowdLevelLabel(level)

  return (
    <div 
      className="inline-flex items-center justify-center gap-[0.375rem] px-[0.5rem] py-[0.25rem] md:px-[0.625rem] md:py-[0.3rem] bg-white/5 border border-white/10 rounded-md text-[0.7rem] md:text-[0.75rem] font-medium text-secondary backdrop-blur-[10px] leading-none"
      style={{ '--crowd-color': color }}
    >
      <Users size={12} className="shrink-0" />
      <span className="font-semibold leading-none" style={{ color: 'var(--crowd-color)' }}>{label}</span>
      <span className="w-[6px] h-[6px] rounded-full animate-pulse shrink-0" style={{ background: 'var(--crowd-color)' }} />
    </div>
  )
}

export default CrowdIndicator
