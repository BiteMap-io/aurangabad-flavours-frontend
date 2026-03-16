import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './EmbeddedMap.css'

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
    <div className="embedded-map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
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
  )
}

export default EmbeddedMap
