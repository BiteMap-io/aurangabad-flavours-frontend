import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to handle map resize after render
const MapResizer = () => {
  const map = useMap()
  
  useEffect(() => {
    // Trigger resize after a short delay to ensure proper rendering
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [map])
  
  return null
}

const EmbeddedMap = ({ 
  height = '300px', 
  zoom = 13, 
  restaurants = [],
  center = [19.8762, 75.3433] // Aurangabad coordinates
}) => {
  const mapRef = useRef(null)

  return (
    <>
      <style>
        {`
          .embedded-map-leaflet-container {
            height: 100%;
            width: 100%;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            z-index: 1;
          }
          .embedded-map-leaflet-container .leaflet-tile-container img {
            border-radius: 0;
          }
          .embedded-map-leaflet-container .leaflet-popup-content-wrapper {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            backdrop-filter: blur(10px);
          }
          .embedded-map-leaflet-container .leaflet-popup-content {
            margin: var(--spacing-sm);
            font-size: 0.9rem;
          }
          .embedded-map-leaflet-container .leaflet-popup-tip {
            background: var(--bg-secondary);
            border: 1px solid var(--glass-border);
          }
          .embedded-map-leaflet-container .leaflet-control-zoom {
            border: 1px solid var(--glass-border);
            background: var(--glass-surface);
            backdrop-filter: blur(10px);
            border-radius: var(--radius-sm);
          }
          .embedded-map-leaflet-container .leaflet-control-zoom a {
            background: var(--glass-surface);
            color: var(--text-primary);
            border: 1px solid var(--glass-border);
            transition: all 0.2s ease;
          }
          .embedded-map-leaflet-container .leaflet-control-zoom a:hover {
            background: var(--glass-hover);
            color: var(--text-primary);
          }
          .embedded-map-leaflet-container .leaflet-control-attribution {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            color: var(--text-secondary);
            font-size: 0.7rem;
            border-radius: var(--radius-sm);
            padding: 2px 6px;
          }
          .embedded-map-leaflet-container .leaflet-control-attribution a {
            color: var(--text-primary);
          }
        `}
      </style>
      <div className="relative w-full overflow-hidden rounded-lg bg-glass-surface border border-glass-border data-[theme=light]:bg-white/90 data-[theme=light]:border-[#e5e7eb]" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          className="embedded-map-leaflet-container"
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance
          }}
        >
          <MapResizer />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => {
              // Backend GeoJSON format is [lng, lat], Leaflet wants [lat, lng]
              const coords = restaurant.location?.coordinates;
              const position = (coords && coords.length === 2) 
                ? [coords[1], coords[0]] 
                : center;

              return (
                <Marker 
                  key={restaurant._id || restaurant.id} 
                  position={position}
                >
                  <Popup>
                    <strong>{restaurant.name}</strong>
                    <br />
                    {restaurant.area || restaurant.cuisine}
                  </Popup>
                </Marker>
              )
            })
          ) : (
            <Marker position={center}>
              <Popup>
                <strong>Aurangabad</strong>
                <br />
                Explore restaurants in this area
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </>
  )
}

export default EmbeddedMap
