import { useCallback, useRef, useState, useEffect, memo } from 'react'
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api'
import { useGoogleMapsLoaded } from '../context/GoogleMapsContext'

const containerStyle = { width: '100%', height: '100%' }

const mapOptions = {
  disableDefaultUI: false,
  clickableIcons: true,
  scrollwheel: true,
  gestureHandling: 'greedy',
}

export default function EmbeddedMap({
  height = '300px',
  zoom = 13,
  restaurants = [],
  center = [19.8762, 75.3433],
  userLocation = null,
  selectedId = null,
  directions = null,
  onMarkerClick = null,
  mapRef: externalMapRef = null,
  travelMode = 'DRIVING',
}) {
  const isLoaded = useGoogleMapsLoaded()

  if (!isLoaded) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-lg bg-glass-surface border border-glass-border flex items-center justify-center text-secondary text-sm"
        style={{ height }}
      >
        Loading map…
      </div>
    )
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-glass-surface border border-glass-border"
      style={{ height }}
    >
      <MapInner
        center={{ lat: center[0], lng: center[1] }}
        zoom={zoom}
        restaurants={restaurants}
        userLocation={userLocation}
        selectedId={selectedId}
        directions={directions}
        onMarkerClick={onMarkerClick}
        externalMapRef={externalMapRef}
        travelMode={travelMode}
      />
    </div>
  )
}

const MapInner = memo(function MapInner({
  center, zoom, restaurants,
  userLocation, selectedId, directions,
  onMarkerClick, externalMapRef, travelMode,
}) {
  const mapRef = useRef(null)
  const [popup, setPopup] = useState(null)
  const prevSel = useRef(null)

  const onLoad = useCallback((map) => {
    mapRef.current = map
    if (externalMapRef) externalMapRef.current = map
  }, [externalMapRef])

  const onUnmount = useCallback(() => {
    mapRef.current = null
    if (externalMapRef) externalMapRef.current = null
  }, [externalMapRef])

  // Pan to selected marker when it changes
  useEffect(() => {
    if (!selectedId || selectedId === prevSel.current) return
    prevSel.current = selectedId
    const r = restaurants.find(r => (r._id || r.id) === selectedId)
    if (!r || !mapRef.current) return
    const c = r.location?.coordinates
    if (c?.length === 2) mapRef.current.panTo({ lat: c[1], lng: c[0] })
  }, [selectedId, restaurants])

  const routeColor = travelMode === 'WALKING' ? '#22c55e'
    : travelMode === 'TWO_WHEELER' ? '#f59e0b'
    : '#8b5cf6'

  // Selected marker icon — large purple circle
  const selectedIcon = {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: '#8b5cf6',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 14,
  }

  // User location icon — blue circle
  const userIcon = {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 10,
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={() => setPopup(null)}
    >
      {/* Restaurant markers — default Google red pin, purple when selected */}
      {restaurants.map(r => {
        const id = r._id || r.id
        const c = r.location?.coordinates
        if (!c || c.length < 2) return null
        const pos = { lat: c[1], lng: c[0] }
        const isSel = id === selectedId

        return (
          <Marker
            key={id}
            position={pos}
            title={r.name}
            icon={isSel ? selectedIcon : undefined}
            zIndex={isSel ? 999 : 5}
            animation={isSel ? window.google.maps.Animation.BOUNCE : null}
            onClick={() => {
              setPopup({ restaurant: r, position: pos })
              onMarkerClick?.(r)
            }}
          />
        )
      })}

      {/* Fallback center marker when no restaurants */}
      {restaurants.length === 0 && (
        <Marker position={center} title="Aurangabad" />
      )}

      {/* Info popup */}
      {popup && (
        <InfoWindow
          position={popup.position}
          onCloseClick={() => setPopup(null)}
        >
          <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 160, maxWidth: 220 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#111' }}>
              {popup.restaurant.name}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#555' }}>
              {popup.restaurant.cuisine}
            </p>
            {popup.restaurant.rating && (
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>
                ⭐ {popup.restaurant.rating} · {popup.restaurant.area}
              </p>
            )}
          </div>
        </InfoWindow>
      )}

      {/* User location */}
      {userLocation && (
        <Marker
          position={userLocation}
          title="You are here"
          icon={userIcon}
          zIndex={1000}
        />
      )}

      {/* Route */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          onLoad={renderer => { rendererRef.current = renderer }}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: routeColor,
              strokeWeight: 5,
              strokeOpacity: 0.9,
            },
          }}
        />
      )}

      {/* Destination red marker */}
      {directions && (() => {
        const dest = directions.routes?.[0]?.legs?.[0]?.end_location
        if (!dest) return null
        return (
          <Marker
            position={{ lat: dest.lat(), lng: dest.lng() }}
            title="Destination"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#e11d48',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 12,
            }}
            zIndex={500}
          />
        )
      })()}
    </GoogleMap>
  )
})
