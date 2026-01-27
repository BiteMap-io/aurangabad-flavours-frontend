import { createContext, useContext, useState } from 'react'

const TouristModeContext = createContext()

export const useTouristMode = () => {
  const context = useContext(TouristModeContext)
  if (!context) {
    throw new Error('useTouristMode must be used within TouristModeProvider')
  }
  return context
}

export const TouristModeProvider = ({ children }) => {
  const [isTouristMode, setIsTouristMode] = useState(false)

  const toggleTouristMode = () => {
    setIsTouristMode(prev => !prev)
  }

  const value = {
    isTouristMode,
    toggleTouristMode,
  }

  return (
    <TouristModeContext.Provider value={value}>
      {children}
    </TouristModeContext.Provider>
  )
}
