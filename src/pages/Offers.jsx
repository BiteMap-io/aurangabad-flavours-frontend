import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tag, MapPin, Calendar, Clock, GraduationCap, SearchX } from 'lucide-react'
import { hotelsApi, offersApi } from '../services/adminApi'
import { SkeletonList } from '../components/SkeletonCard'
import { getOfferBadge, isOfferLive } from '../utils/offerUtils'
import useSEO from '../hooks/useSEO'

const formatDateRange = (offer) => {
  const opts = { day: 'numeric', month: 'short' }
  const start = new Date(offer.startDate).toLocaleDateString(undefined, opts)
  const end = new Date(offer.endDate).toLocaleDateString(undefined, opts)
  return start === end ? start : `${start} – ${end}`
}

const OfferCard = ({ offer, restaurant, index }) => {
  const restaurantId = restaurant?._id || restaurant?.id
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={restaurantId ? `/place/${restaurantId}` : '#'}
        className="group flex flex-col h-full bg-glass-surface border border-glass-border rounded-[1.25rem] overflow-hidden no-underline transition-all duration-300 hover:border-accent-purple/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:-translate-y-[2px]"
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0">
          <img
            src={restaurant?.image}
            alt={restaurant?.name || 'Restaurant'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3">
            <p className="text-white font-bold text-[0.98rem] m-0 leading-tight truncate drop-shadow">{restaurant?.name || 'Restaurant'}</p>
            {restaurant?.area && (
              <p className="text-white/85 text-[0.78rem] m-0 flex items-center gap-1 truncate">
                <MapPin size={11} /> {restaurant.area}
              </p>
            )}
          </div>
          {offer.audience === 'student' && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-[0.68rem] font-bold rounded-full shadow-lg">
              <GraduationCap size={11} /> Student
            </span>
          )}
        </div>

        <div className="p-md flex flex-col gap-xs flex-1">
          <h3 className="font-serif text-[1.05rem] font-bold text-primary leading-[1.25] m-0">{offer.title}</h3>

          <span className="inline-flex self-start items-center gap-1 px-2.5 py-1 rounded-pill text-[0.78rem] font-semibold bg-accent-purple/15 text-accent-purple border border-accent-purple/25">
            <Tag size={12} /> {getOfferBadge(offer)}
          </span>

          {offer.description && (
            <p className="text-secondary text-[0.85rem] leading-[1.5] m-0 line-clamp-2">{offer.description}</p>
          )}

          <div className="flex items-center gap-sm mt-auto pt-xs text-tertiary text-[0.75rem]">
            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateRange(offer)}</span>
            {offer.startTime && (
              <span className="flex items-center gap-1"><Clock size={12} /> {offer.startTime}–{offer.endTime || ''}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const Offers = () => {
  const [offers, setOffers] = useState([])
  const [restaurantsById, setRestaurantsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [audienceFilter, setAudienceFilter] = useState('all')

  useSEO({
    title: 'Offers & Deals',
    description: 'Browse the latest restaurant offers, discounts and student deals in Aurangabad.',
    url: '/offers',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [offersRes, hotelsRes] = await Promise.all([offersApi.getAll(), hotelsApi.getAll()])
        const offersData = offersRes.data || offersRes
        const hotelsData = hotelsRes.data || hotelsRes
        setOffers(Array.isArray(offersData) ? offersData : [])

        const map = {}
        if (Array.isArray(hotelsData)) {
          hotelsData.forEach(h => { map[h._id || h.id] = h })
        }
        setRestaurantsById(map)
      } catch (error) {
        console.error('Failed to fetch offers:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const liveOffers = useMemo(() => {
    return offers
      .filter(isOfferLive)
      .filter(o => audienceFilter === 'all' || o.audience === audienceFilter)
      .filter(o => restaurantsById[o.restaurantId]) // hide offers whose restaurant isn't public
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
  }, [offers, restaurantsById, audienceFilter])

  return (
    <div className="min-h-screen py-xl px-sm md:px-lg max-w-[1400px] mx-auto">
      <div className="relative text-center mb-xl py-xl px-lg min-h-[180px] flex flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-background-secondary border border-glass-border">
        <h1 className="text-[2.4rem] mb-xs text-primary flex items-center gap-2">
          <Tag className="text-accent-purple" size={32} /> Offers & Deals
        </h1>
        <p className="text-[1.05rem] text-secondary opacity-90 m-0">Live discounts, combos and student deals from restaurants around you</p>
      </div>

      <div className="flex items-center gap-sm mb-lg">
        {[
          { key: 'all', label: 'All Offers' },
          { key: 'student', label: 'Student Deals' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setAudienceFilter(f.key)}
            className={`py-2 px-4 rounded-pill text-[0.85rem] font-semibold border transition-all duration-200 ${
              audienceFilter === f.key
                ? 'bg-accent-purple/15 border-accent-purple text-accent-purple'
                : 'bg-glass-surface border-glass-border text-secondary hover:border-accent-purple/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          <SkeletonList count={6} />
        </div>
      ) : liveOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-xl bg-glass-surface border border-glass-border rounded-[1.5rem] gap-md">
          <div className="w-16 h-16 rounded-full bg-accent-purple/10 flex items-center justify-center">
            <SearchX size={32} className="text-accent-purple" />
          </div>
          <div>
            <p className="text-primary text-[1.2rem] font-semibold mb-xs">No live offers right now</p>
            <p className="text-secondary text-[0.95rem]">Check back soon — restaurant owners add new deals all the time.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {liveOffers.map((offer, i) => (
            <OfferCard key={offer._id || offer.id} offer={offer} restaurant={restaurantsById[offer.restaurantId]} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Offers
