import { useState, useCallback } from 'react'

/**
 * useDirections — shared hook for geolocation + Google Maps routing.
 * Returns state and a `getDirections(restaurant)` trigger.
 */
export function useDirections() {
  const [userLocation, setUserLocation] = useState(null)
  const [directions, setDirections] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)   // { distance, duration }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const clear = useCallback(() => {
    setDirections(null)
    setRouteInfo(null)
    setError('')
  }, [])

  const getDirections = useCallback((restaurant) => {
    const coords = restaurant?.location?.coordinates
    if (!coords || coords.length < 2) {
      setError('No location data available for this restaurant.')
      return
    }
    const destination = { lat: coords[1], lng: coords[0] }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setLoading(true)
    setError('')
    setDirections(null)
    setRouteInfo(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(origin)

        const service = new window.google.maps.DirectionsService()
        service.route(
          { origin, destination, travelMode: window.google.maps.TravelMode.DRIVING },
          (result, status) => {
            setLoading(false)
            if (status === 'OK') {
              setDirections(result)
              const leg = result.routes[0]?.legs[0]
              setRouteInfo({
                distance: leg?.distance?.text || '',
                duration: leg?.duration?.text || '',
              })
            } else {
              console.error('DirectionsService failed:', status)
              setError('Could not calculate route. Please try again.')
            }
          }
        )
      },
      (err) => {
        setLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. Please allow location access.')
        } else {
          setError('Unable to get your location. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { userLocation, directions, routeInfo, loading, error, getDirections, clear }
}
