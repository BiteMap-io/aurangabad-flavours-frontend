import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader, Navigation, X, Clock, Route, Car, PersonStanding, Bike, Star, Heart, SlidersHorizontal, ChevronDown, Trophy } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import RestaurantModal from '../components/RestaurantModal'
import EmbeddedMap from '../components/EmbeddedMap'
import { hotelsApi } from '../services/adminApi'

// ─── Constants ────────────────────────────────────────────────────────────────
const CSN_CENTER = { lat: 19.8762, lng: 75.3433 }
const NEAR_ME_RADIUS_KM = 8
const FAVORITES_KEY = 'af_saved_restaurants'

const TRAVEL_MODES = [
  { id: 'DRIVING',     label: 'Drive',  icon: Car,            color: '#8b5cf6' },
  { id: 'WALKING',     label: 'Walk',   icon: PersonStanding, color: '#22c55e' },
  { id: 'TWO_WHEELER', label: 'Bike',   icon: Bike,           color: '#f59e0b' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function topPickScore(r) {
  const dist = r._distKm || 1
  return (r.rating || 0) + 1 / dist
}

function loadFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') } catch { return [] }
}
function saveFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
}

// ─── MapView Component ────────────────────────────────────────────────────────
const MapView = () => {
  const [searchParams] = useSearchParams()
  const directToId = searchParams.get('directTo')

  // Data
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Location & Near Me
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [nearMeActive, setNearMeActive] = useState(false)
  const [nearbyRestaurants, setNearbyRestaurants] = useState([])

  // Routing
  const [activeRestaurant, setActiveRestaurant] = useState(null)
  const [directions, setDirections] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState('')
  const [travelMode, setTravelMode] = useState('DRIVING')

  // Filters & sort (Phase 3)
  const [showFilters, setShowFilters] = useState(false)
  const [filterRating, setFilterRating] = useState('')       // '4' | '4.5' | ''
  const [filterDistance, setFilterDistance] = useState('')   // '2' | '5' | ''
  const [filterPrice, setFilterPrice] = useState('')         // '₹' | '₹₹' | '₹₹₹' | ''
  const [filterCuisine, setFilterCuisine] = useState('')
  const [sortBy, setSortBy] = useState('nearest')            // 'nearest' | 'rating'
  const [selectedArea, setSelectedArea] = useState('')

  // Favorites (Phase 7)
  const [favorites, setFavorites] = useState(loadFavorites)

  // Map
  const [mapCenter, setMapCenter] = useState([CSN_CENTER.lat, CSN_CENTER.lng])
  const [mapZoom, setMapZoom] = useState(13)
  const mapRef = useRef(null)
  const listRef = useRef(null)
  const cardRefs = useRef({})

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    hotelsApi.getAll()
      .then(res => { const d = res.data || res; setRestaurants(Array.isArray(d) ? d : []) })
      .catch(err => console.error('Failed to fetch restaurants:', err))
      .finally(() => setLoading(false))
  }, [])

  // ── Auto-route from ?directTo=id ───────────────────────────────────────────
  useEffect(() => {
    if (!directToId || loading || restaurants.length === 0) return
    const target = restaurants.find(r => (r._id || r.id) === directToId)
    if (!target?.location?.coordinates?.length) return
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setLocationLoading(false)
        triggerRoute(target, loc, travelMode)
      },
      () => { setLocationLoading(false); setLocationError('Could not get location.') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [directToId, loading, restaurants])

  // ── Area stats ─────────────────────────────────────────────────────────────
  const areaStats = useMemo(() => {
    const stats = {}
    restaurants.forEach(r => { if (r.area) stats[r.area] = (stats[r.area] || 0) + 1 })
    return Object.entries(stats).map(([name, count]) => ({ name, count }))
  }, [restaurants])

  // ── Cuisine list ───────────────────────────────────────────────────────────
  const cuisineList = useMemo(() => {
    const set = new Set()
    restaurants.forEach(r => r.cuisine?.split(',').forEach(c => set.add(c.trim())))
    return Array.from(set).sort()
  }, [restaurants])

  // ── Displayed restaurants (filters + sort) ─────────────────────────────────
  const displayedRestaurants = useMemo(() => {
    let list = nearMeActive ? nearbyRestaurants
      : selectedArea ? restaurants.filter(r => r.area === selectedArea)
      : restaurants

    if (filterRating) list = list.filter(r => (r.rating || 0) >= parseFloat(filterRating))
    if (filterDistance && nearMeActive) list = list.filter(r => (r._distKm || 0) <= parseFloat(filterDistance))
    if (filterPrice) list = list.filter(r => r.priceRange === filterPrice)
    if (filterCuisine) list = list.filter(r => r.cuisine?.toLowerCase().includes(filterCuisine.toLowerCase()))

    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sortBy === 'nearest' && nearMeActive) list = [...list].sort((a, b) => (a._distKm || 0) - (b._distKm || 0))

    return list
  }, [nearMeActive, nearbyRestaurants, selectedArea, restaurants, filterRating, filterDistance, filterPrice, filterCuisine, sortBy])

  // ── Top picks (Phase 3) ────────────────────────────────────────────────────
  const topPicks = useMemo(() => {
    if (!nearMeActive || nearbyRestaurants.length === 0) return []
    return [...nearbyRestaurants]
      .sort((a, b) => topPickScore(b) - topPickScore(a))
      .slice(0, 3)
  }, [nearMeActive, nearbyRestaurants])

  // ── Near Me ────────────────────────────────────────────────────────────────
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return }
    setLocationLoading(true)
    setLocationError('')
    setDirections(null)
    setRouteInfo(null)
    setActiveRestaurant(null)

    const applyLocation = (lat, lng) => {
      setUserLocation({ lat, lng })
      setMapCenter([lat, lng])
      setMapZoom(14)
      setNearMeActive(true)
      setSelectedArea('')
      const nearby = restaurants
        .map(r => {
          const c = r.location?.coordinates
          if (!c || c.length < 2) return null
          const dist = haversineKm(lat, lng, c[1], c[0])
          return dist <= NEAR_ME_RADIUS_KM ? { ...r, _distKm: dist } : null
        })
        .filter(Boolean)
        .sort((a, b) => a._distKm - b._distKm)
      setNearbyRestaurants(nearby)
      setLocationLoading(false)
      setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
    }

    // Try high-accuracy GPS first (good on mobile), fall back to network/IP (desktop)
    navigator.geolocation.getCurrentPosition(
      pos => applyLocation(pos.coords.latitude, pos.coords.longitude),
      () => navigator.geolocation.getCurrentPosition(
        pos => applyLocation(pos.coords.latitude, pos.coords.longitude),
        err => {
          setLocationLoading(false)
          setLocationError(err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Please allow location in your browser settings.'
            : 'Unable to get your location. Please try again.')
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      ),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    )
  }, [restaurants])

  const clearNearMe = useCallback(() => {
    setNearMeActive(false)
    setUserLocation(null)
    setNearbyRestaurants([])
    setDirections(null)
    setRouteInfo(null)
    setActiveRestaurant(null)
    setMapCenter([CSN_CENTER.lat, CSN_CENTER.lng])
    setMapZoom(13)
    setLocationError('')
  }, [])

  // ── Routing ────────────────────────────────────────────────────────────────
  const triggerRoute = useCallback((restaurant, origin, mode) => {
    const coords = restaurant?.location?.coordinates
    if (!coords || coords.length < 2) { setRouteError('No location data for this restaurant.'); return }
    const destination = { lat: coords[1], lng: coords[0] }

    setActiveRestaurant(restaurant)
    setRouteLoading(true)
    setRouteError('')
    setDirections(null)
    setRouteInfo(null)

    const id = restaurant._id || restaurant.id
    setTimeout(() => cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200)

    const gmMode = mode === 'TWO_WHEELER'
      ? window.google.maps.TravelMode.TWO_WHEELER
      : (window.google.maps.TravelMode[mode] || window.google.maps.TravelMode.DRIVING)

    const doRoute = (org) => {
      new window.google.maps.DirectionsService().route(
        { origin: org, destination, travelMode: gmMode },
        (result, status) => {
          if (status === 'OK') {
            setRouteLoading(false)
            setDirections(result)
            const leg = result.routes[0]?.legs[0]
            setRouteInfo({ distance: leg?.distance?.text || '', duration: leg?.duration?.text || '' })
            if (mapRef.current) mapRef.current.fitBounds(result.routes[0].bounds)
          } else if (mode === 'TWO_WHEELER') {
            // Fallback: TWO_WHEELER not available in all regions
            new window.google.maps.DirectionsService().route(
              { origin: org, destination, travelMode: window.google.maps.TravelMode.DRIVING },
              (r2, s2) => {
                setRouteLoading(false)
                if (s2 === 'OK') {
                  setDirections(r2)
                  const leg2 = r2.routes[0]?.legs[0]
                  setRouteInfo({ distance: leg2?.distance?.text || '', duration: leg2?.duration?.text || '' })
                  if (mapRef.current) mapRef.current.fitBounds(r2.routes[0].bounds)
                } else {
                  setRouteError('Could not calculate route.')
                }
              }
            )
          } else {
            setRouteLoading(false)
            setRouteError('Could not calculate route. Please try again.')
          }
        }
      )
    }

    if (origin) {
      // Origin already known — route immediately
      doRoute(origin)
    } else {
      // Need to get user location first
      if (!navigator.geolocation) {
        setRouteLoading(false)
        setRouteError('Geolocation not supported.')
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          doRoute(loc)
        },
        () => navigator.geolocation.getCurrentPosition(
          pos => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setUserLocation(loc)
            doRoute(loc)
          },
          () => {
            setRouteLoading(false)
            setRouteError('Could not get your location. Please enable location access.')
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        ),
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      )
    }
  }, [])

  const handleMarkerClick = useCallback((restaurant) => {
    // Always trigger route — triggerRoute fetches location if not yet known
    triggerRoute(restaurant, userLocation, travelMode)
  }, [userLocation, travelMode, triggerRoute])

  // Card click — center map + trigger route
  const handleCardClick = useCallback((restaurant) => {
    const coords = restaurant.location?.coordinates
    if (coords?.length === 2 && mapRef.current) {
      mapRef.current.panTo({ lat: coords[1], lng: coords[0] })
      mapRef.current.setZoom(16)
    }
    setActiveRestaurant(restaurant)
    triggerRoute(restaurant, userLocation, travelMode)
  }, [userLocation, travelMode, triggerRoute])

  const handleCardInfoClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }, [])

  // Travel mode change — re-route if active
  const handleTravelModeChange = useCallback((mode) => {
    setTravelMode(mode)
    if (activeRestaurant && userLocation) {
      triggerRoute(activeRestaurant, userLocation, mode)
    }
  }, [activeRestaurant, userLocation, triggerRoute])

  const clearRoute = useCallback(() => {
    setDirections(null)
    setRouteInfo(null)
    setActiveRestaurant(null)
    setRouteError('')
  }, [])

  // ── Favorites ──────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((e, id) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      saveFavorites(next)
      return next
    })
  }, [])

  const isFav = (id) => favorites.includes(id)

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative min-h-[45vh] max-md:min-h-[38vh] flex items-center justify-center py-xl px-lg max-md:px-md mb-xl overflow-hidden bg-[url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&q=80')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/70 z-[1]" />
        <div className="relative z-[2] text-center max-w-[800px] w-full">
          <motion.h1 className="text-[3rem] max-md:text-[2rem] font-bold mb-sm text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Restaurant Map
          </motion.h1>
          <motion.p className="text-[1.1rem] text-white/90 mb-lg"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            Discover, explore and navigate to restaurants near you
          </motion.p>

          {/* Near Me + Clear */}
          <motion.div className="flex items-center justify-center gap-sm flex-wrap"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            {!nearMeActive ? (
              <button onClick={handleNearMe} disabled={locationLoading}
                className="flex items-center gap-xs py-sm px-lg bg-accent-purple hover:bg-accent-purple/80 border border-white/20 rounded-pill text-white font-semibold text-[1rem] cursor-pointer transition-all duration-300 disabled:opacity-60 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)] hover:-translate-y-[2px]">
                {locationLoading ? <><Loader size={18} className="animate-spin" /> Locating…</> : <><Navigation size={18} /> Near Me</>}
              </button>
            ) : (
              <button onClick={clearNearMe}
                className="flex items-center gap-xs py-sm px-lg bg-white/10 hover:bg-white/20 border border-white/30 rounded-pill text-white font-semibold cursor-pointer transition-all duration-300">
                <X size={18} /> Clear Near Me
              </button>
            )}
          </motion.div>

          {locationError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-sm text-[0.88rem] text-red-400 drop-shadow">
              {locationError}
            </motion.p>
          )}
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-lg max-md:px-md">

        {/* ── Top Picks (Phase 3) ── */}
        <AnimatePresence>
          {topPicks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-lg">
              <div className="flex items-center gap-xs mb-md">
                <Trophy size={18} className="text-accent-gold" />
                <h3 className="text-[1.1rem] font-bold text-primary m-0">Recommended Near You</h3>
              </div>
              <div className="flex gap-md overflow-x-auto pb-sm scrollbar-none">
                {topPicks.map(r => {
                  const id = r._id || r.id
                  return (
                    <motion.div key={id} whileHover={{ scale: 1.03, y: -2 }} transition={{ duration: 0.2 }}
                      className="shrink-0 w-[180px] bg-glass-surface border border-accent-purple/30 rounded-xl overflow-hidden cursor-pointer hover:border-accent-purple hover:shadow-[0_0_16px_rgba(139,92,246,0.25)] transition-all duration-200"
                      onClick={() => handleCardClick(r)}>
                      <div className="w-full h-[90px] overflow-hidden">
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-sm">
                        <p className="text-[0.85rem] font-semibold text-primary m-0 truncate">{r.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[0.75rem] text-accent-purple font-medium">⭐ {r.rating}</span>
                          <span className="text-[0.72rem] text-secondary">{r._distKm?.toFixed(1)} km</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters bar (Phase 3) ── */}
        {nearMeActive && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-lg">
            <div className="flex items-center gap-sm flex-wrap">
              <button onClick={() => setShowFilters(f => !f)}
                className="flex items-center gap-1 py-1 px-md bg-glass-surface border border-glass-border rounded-pill text-secondary text-[0.85rem] cursor-pointer hover:border-accent-purple hover:text-primary transition-all duration-200">
                <SlidersHorizontal size={14} /> Filters <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort pills */}
              {[{ id: 'nearest', label: 'Nearest' }, { id: 'rating', label: 'Top Rated' }].map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id)}
                  className={`py-1 px-md rounded-pill text-[0.82rem] font-medium border cursor-pointer transition-all duration-200 ${sortBy === s.id ? 'bg-accent-purple text-white border-accent-purple' : 'bg-glass-surface text-secondary border-glass-border hover:border-accent-purple'}`}>
                  {s.label}
                </button>
              ))}

              <span className="ml-auto text-[0.82rem] text-secondary">
                {displayedRestaurants.length} result{displayedRestaurants.length !== 1 ? 's' : ''}
              </span>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-md flex flex-wrap gap-sm overflow-hidden">
                  {/* Rating */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.75rem] text-tertiary uppercase tracking-wide">Rating</span>
                    <div className="flex gap-1">
                      {['', '4', '4.5'].map(v => (
                        <button key={v} onClick={() => setFilterRating(v)}
                          className={`py-1 px-sm rounded-md text-[0.8rem] border cursor-pointer transition-all ${filterRating === v ? 'bg-accent-purple text-white border-accent-purple' : 'bg-glass-surface text-secondary border-glass-border hover:border-accent-purple'}`}>
                          {v === '' ? 'All' : `${v}+`}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Distance */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.75rem] text-tertiary uppercase tracking-wide">Distance</span>
                    <div className="flex gap-1">
                      {['', '2', '5'].map(v => (
                        <button key={v} onClick={() => setFilterDistance(v)}
                          className={`py-1 px-sm rounded-md text-[0.8rem] border cursor-pointer transition-all ${filterDistance === v ? 'bg-accent-purple text-white border-accent-purple' : 'bg-glass-surface text-secondary border-glass-border hover:border-accent-purple'}`}>
                          {v === '' ? 'All' : `<${v}km`}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.75rem] text-tertiary uppercase tracking-wide">Price</span>
                    <div className="flex gap-1">
                      {['', '₹', '₹₹', '₹₹₹'].map(v => (
                        <button key={v} onClick={() => setFilterPrice(v)}
                          className={`py-1 px-sm rounded-md text-[0.8rem] border cursor-pointer transition-all ${filterPrice === v ? 'bg-accent-purple text-white border-accent-purple' : 'bg-glass-surface text-secondary border-glass-border hover:border-accent-purple'}`}>
                          {v === '' ? 'All' : v}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Cuisine */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.75rem] text-tertiary uppercase tracking-wide">Cuisine</span>
                    <select value={filterCuisine} onChange={e => setFilterCuisine(e.target.value)}
                      className="py-1 px-sm rounded-md text-[0.8rem] border border-glass-border bg-glass-surface text-secondary cursor-pointer focus:outline-none focus:border-accent-purple">
                      <option value="">All</option>
                      {cuisineList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Clear filters */}
                  {(filterRating || filterDistance || filterPrice || filterCuisine) && (
                    <button onClick={() => { setFilterRating(''); setFilterDistance(''); setFilterPrice(''); setFilterCuisine('') }}
                      className="self-end py-1 px-sm rounded-md text-[0.8rem] border border-red-400/40 text-red-400 bg-red-400/10 cursor-pointer hover:bg-red-400/20 transition-all">
                      Clear filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Area filter (non-Near Me) ── */}
        {!nearMeActive && (
          <div className="mb-xl">
            <h2 className="text-[1.5rem] mb-lg text-primary text-center">Filter by Area</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-md max-w-[1200px] mx-auto">
              {[{ name: 'All Areas', count: restaurants.length, value: '' }, ...areaStats.map(a => ({ ...a, value: a.name }))].map(area => (
                <motion.div key={area.value}
                  className={`flex flex-col items-center gap-xs p-lg bg-glass-surface border border-glass-border rounded-lg cursor-pointer transition-all duration-300 text-center hover:bg-glass-hover hover:border-white/20 ${selectedArea === area.value ? '!bg-glass-hover !border-accent-purple shadow-[0_0_20px_var(--accent-purple)]' : ''}`}
                  onClick={() => setSelectedArea(area.value)}
                  whileHover={{ scale: 1.04, y: -2 }} transition={{ duration: 0.2 }}>
                  <MapPin size={18} />
                  <span className="text-[0.95rem] font-semibold text-primary">{area.name}</span>
                  <small className="text-[0.82rem] text-secondary">{area.count} restaurants</small>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Near Me header ── */}
        {nearMeActive && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-md flex items-center gap-sm flex-wrap">
            <Navigation size={18} className="text-accent-purple" />
            <h2 className="text-[1.3rem] text-primary m-0">
              {nearbyRestaurants.length > 0
                ? `${nearbyRestaurants.length} restaurants within ${NEAR_ME_RADIUS_KM} km`
                : 'No restaurants found nearby'}
            </h2>
          </motion.div>
        )}

        {/* ── Main grid ── */}
        <div ref={listRef} className="grid grid-cols-[380px_1fr] max-lg:grid-cols-1 gap-lg h-[calc(100vh-280px)] min-h-[600px] max-lg:h-auto mb-xl relative">

          {/* Restaurant list */}
          <div className="bg-glass-surface border border-glass-border rounded-xl overflow-y-auto max-lg:max-h-[420px]">
            <div className="sticky top-0 z-10 bg-glass-surface border-b border-glass-border px-lg py-md backdrop-blur-md">
              <h2 className="text-[1.1rem] font-bold text-primary m-0">
                {nearMeActive ? 'Nearby Restaurants' : selectedArea ? `In ${selectedArea}` : 'All Restaurants'}
              </h2>
            </div>

            <div className="flex flex-col gap-sm p-md">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[200px] gap-sm text-secondary">
                  <Loader className="animate-spin" size={28} />
                  <span className="text-[0.9rem]">Loading restaurants…</span>
                </div>
              ) : displayedRestaurants.length > 0 ? (
                displayedRestaurants.map(restaurant => {
                  const id = restaurant._id || restaurant.id
                  const isActive = activeRestaurant && (activeRestaurant._id || activeRestaurant.id) === id
                  const fav = isFav(id)
                  return (
                    <motion.div key={id} ref={el => cardRefs.current[id] = el}
                      className={`flex gap-sm p-sm bg-glass-surface border rounded-xl transition-all duration-250 cursor-pointer
                        ${isActive ? '!border-accent-purple shadow-[0_0_18px_rgba(139,92,246,0.3)] bg-accent-purple/5' : 'border-glass-border hover:border-accent-purple/40 hover:bg-glass-hover'}`}
                      onClick={() => handleCardClick(restaurant)}
                      whileHover={{ scale: 1.01 }} transition={{ duration: 0.15 }}>

                      {/* Image */}
                      <div className="relative w-[68px] h-[68px] rounded-lg overflow-hidden shrink-0">
                        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                        {isActive && (
                          <div className="absolute inset-0 bg-accent-purple/20 flex items-center justify-center">
                            <Navigation size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[0.92rem] font-semibold text-primary m-0 truncate leading-tight">{restaurant.name}</h3>
                          <button onClick={e => toggleFavorite(e, id)}
                            className={`shrink-0 p-0.5 rounded-full transition-colors ${fav ? 'text-red-400' : 'text-tertiary hover:text-red-400'}`}>
                            <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <p className="text-[0.78rem] text-secondary m-0 truncate">{restaurant.cuisine}</p>
                        <div className="flex items-center gap-sm mt-1 flex-wrap">
                          <span className="text-[0.75rem] text-secondary flex items-center gap-0.5"><MapPin size={11} />{restaurant.area}</span>
                          {restaurant.rating && <span className="text-[0.75rem] text-accent-purple font-semibold">⭐ {restaurant.rating}</span>}
                          {nearMeActive && restaurant._distKm != null && (
                            <span className="text-[0.75rem] text-accent-purple font-bold flex items-center gap-0.5">
                              <Navigation size={11} />{restaurant._distKm.toFixed(1)} km
                            </span>
                          )}
                        </div>

                        {/* Route summary */}
                        {isActive && routeInfo && (
                          <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-xs mt-1 text-[0.75rem] text-accent-purple font-semibold">
                            <Route size={11} />
                            <span>{routeInfo.distance} · {routeInfo.duration}</span>
                            <button onClick={e => { e.stopPropagation(); clearRoute() }}
                              className="ml-auto text-tertiary hover:text-primary"><X size={11} /></button>
                          </motion.div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-xs mt-2">
                          <button onClick={e => { e.stopPropagation(); handleCardInfoClick(restaurant) }}
                            className="text-[0.72rem] text-secondary border border-glass-border rounded-md px-2 py-0.5 hover:border-accent-purple hover:text-primary transition-all">
                            View Details
                          </button>
                          {nearMeActive && (
                            isActive && routeLoading ? (
                              <span className="flex items-center gap-1 text-[0.72rem] text-secondary">
                                <Loader size={11} className="animate-spin" /> Routing…
                              </span>
                            ) : (
                              <button onClick={e => { e.stopPropagation(); handleCardClick(restaurant) }}
                                className={`flex items-center gap-1 text-[0.72rem] font-semibold rounded-md px-2 py-0.5 border transition-all
                                  ${isActive ? 'bg-accent-purple text-white border-accent-purple' : 'bg-accent-purple/10 text-accent-purple border-accent-purple/30 hover:bg-accent-purple/20'}`}>
                                <Navigation size={11} />
                                {isActive ? 'Routing' : 'Directions'}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : nearMeActive ? (
                <div className="flex flex-col items-center justify-center h-[200px] gap-sm text-secondary text-center">
                  <Navigation size={32} className="opacity-30" />
                  <p className="text-[0.9rem]">No restaurants within {NEAR_ME_RADIUS_KM} km</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] gap-sm text-secondary">
                  <p className="text-[0.9rem]">No restaurants found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Map container */}
          <div className="bg-glass-surface border border-glass-border rounded-xl overflow-hidden relative h-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-accent-purple">
                <Loader size={48} className="animate-spin" />
              </div>
            ) : (
              <EmbeddedMap
                height="100%"
                zoom={mapZoom}
                center={mapCenter}
                restaurants={displayedRestaurants}
                userLocation={userLocation}
                selectedId={activeRestaurant ? (activeRestaurant._id || activeRestaurant.id) : null}
                directions={directions}
                onMarkerClick={handleMarkerClick}
                mapRef={mapRef}
                travelMode={travelMode}
              />
            )}

            {/* ── Floating Route Panel (Phase 2) ── */}
            <AnimatePresence>
              {(routeInfo || routeLoading || routeError) && (
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 60 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-[480px]"
                >
                  <div className="bg-background-primary/95 backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                    {/* Route info row */}
                    <div className="flex items-center gap-md px-md py-sm">
                      {routeLoading && (
                        <div className="flex items-center gap-sm text-secondary flex-1">
                          <Loader size={16} className="animate-spin text-accent-purple" />
                          <span className="text-[0.88rem]">Calculating route…</span>
                        </div>
                      )}
                      {routeError && <span className="text-red-400 text-[0.85rem] flex-1">{routeError}</span>}
                      {routeInfo && (
                        <>
                          <div className="flex items-center gap-xs">
                            {(() => { const M = TRAVEL_MODES.find(m => m.id === travelMode); return M ? <M.icon size={20} style={{ color: M.color }} /> : null })()}
                          </div>
                          <div className="flex-1">
                            <p className="text-primary font-bold m-0 text-[0.95rem] truncate">
                              {activeRestaurant?.name}
                            </p>
                            <p className="text-secondary m-0 text-[0.82rem]">
                              🕐 {routeInfo.duration} &nbsp;·&nbsp; 📍 {routeInfo.distance}
                            </p>
                          </div>
                          <button onClick={clearRoute}
                            className="p-1 rounded-full hover:bg-glass-hover text-secondary hover:text-primary transition-colors">
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Travel mode switcher */}
                    <div className="flex border-t border-glass-border">
                      {TRAVEL_MODES.map(mode => {
                        const Icon = mode.icon
                        const active = travelMode === mode.id
                        return (
                          <button key={mode.id} onClick={() => handleTravelModeChange(mode.id)}
                            className={`flex-1 flex items-center justify-center gap-1 py-sm text-[0.8rem] font-semibold transition-all duration-200 cursor-pointer border-none
                              ${active ? 'text-white' : 'text-secondary hover:text-primary bg-transparent'}`}
                            style={active ? { backgroundColor: mode.color } : {}}>
                            <Icon size={15} />
                            {mode.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Saved Restaurants (Phase 7) ── */}
        {favorites.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-xl">
            <div className="flex items-center gap-xs mb-md">
              <Heart size={18} className="text-red-400" fill="currentColor" />
              <h3 className="text-[1.1rem] font-bold text-primary m-0">Saved Restaurants</h3>
              <span className="text-[0.8rem] text-secondary ml-1">({favorites.length})</span>
            </div>
            <div className="flex gap-md overflow-x-auto pb-sm scrollbar-none">
              {restaurants.filter(r => favorites.includes(r._id || r.id)).map(r => {
                const id = r._id || r.id
                return (
                  <motion.div key={id} whileHover={{ scale: 1.03 }} transition={{ duration: 0.15 }}
                    className="shrink-0 w-[160px] bg-glass-surface border border-glass-border rounded-xl overflow-hidden cursor-pointer hover:border-red-400/40 transition-all"
                    onClick={() => handleCardClick(r)}>
                    <div className="w-full h-[80px] overflow-hidden relative">
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                      <button onClick={e => toggleFavorite(e, id)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-red-400">
                        <Heart size={12} fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-sm">
                      <p className="text-[0.82rem] font-semibold text-primary m-0 truncate">{r.name}</p>
                      <p className="text-[0.72rem] text-secondary m-0 truncate">{r.area}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedRestaurant(null) }}
      />
    </div>
  )
}

export default MapView
