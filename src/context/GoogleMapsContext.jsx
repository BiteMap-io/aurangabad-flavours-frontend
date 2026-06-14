import { createContext, useContext } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

// Must be a stable, module-level reference — passing a fresh array each render
// makes the loader warn and reload the script.
const LIBRARIES = ['places']

const GoogleMapsContext = createContext(false)

export const GoogleMapsProvider = ({ children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('GoogleMapsProvider: VITE_GOOGLE_MAPS_API_KEY is not set.')
  }

  // useJsApiLoader gives a real `isLoaded` flag that only flips true once the
  // Google Maps script has actually finished loading — so consumers can safely
  // touch `window.google`. (The old LoadScript approach reported "loaded"
  // immediately, before `window.google` existed, crashing the map.)
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
  })

  return (
    <GoogleMapsContext.Provider value={isLoaded && !!apiKey}>
      {children}
    </GoogleMapsContext.Provider>
  )
}

export const useGoogleMapsLoaded = () => useContext(GoogleMapsContext)
