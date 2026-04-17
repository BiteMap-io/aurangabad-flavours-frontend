import { createContext, useContext } from 'react'
import { LoadScript } from '@react-google-maps/api'

const LIBRARIES = ['places']

const GoogleMapsContext = createContext(false)

export const GoogleMapsProvider = ({ children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('GoogleMapsProvider: VITE_GOOGLE_MAPS_API_KEY is not set.')
    return <GoogleMapsContext.Provider value={false}>{children}</GoogleMapsContext.Provider>
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={LIBRARIES} loadingElement={<></>}>
      <GoogleMapsContext.Provider value={true}>{children}</GoogleMapsContext.Provider>
    </LoadScript>
  )
}

export const useGoogleMapsLoaded = () => useContext(GoogleMapsContext)
