import { Users } from 'lucide-react'
import { getCrowdLevelColor, getCrowdLevelLabel } from '../utils/diningUtils'
import './CrowdIndicator.css'

const CrowdIndicator = ({ level }) => {
  if (!level) return null

  const color = getCrowdLevelColor(level)
  const label = getCrowdLevelLabel(level)

  return (
    <div className="crowd-indicator" style={{ '--crowd-color': color }}>
      <Users size={12} />
      <span className="crowd-label">{label}</span>
      <span className="crowd-dot" />
    </div>
  )
}

export default CrowdIndicator
