import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, X, ChevronLeft, ChevronRight, Clock, Users, Ticket, CalendarDays } from 'lucide-react'
import { eventsApi } from '../services/adminApi'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const eventName = (e) => e.name || e.title || 'Untitled Event'
const parseDate = (d) => { const x = new Date(d); return isNaN(x.getTime()) ? null : x }
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [calCursor, setCalCursor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const cardRefs = useRef({})

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll()
        const data = response.data || response
        setEvents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Attach parsed dates; keep only sortable ones up front.
  const withDates = useMemo(() =>
    events.map(e => ({ ...e, _d: parseDate(e.date) })), [events])

  // Sorted ascending by date (undated events sink to the bottom).
  const sorted = useMemo(() =>
    [...withDates].sort((a, b) => {
      if (!a._d) return 1
      if (!b._d) return -1
      return a._d - b._d
    }), [withDates])

  // Map of dayKey -> count, for calendar dots.
  const eventsByDay = useMemo(() => {
    const m = {}
    withDates.forEach(e => { if (e._d) { const k = dayKey(e._d); m[k] = (m[k] || 0) + 1 } })
    return m
  }, [withDates])

  // Group the agenda by "Month Year".
  const grouped = useMemo(() => {
    const groups = []
    const index = {}
    sorted.forEach(e => {
      const label = e._d ? `${MONTHS[e._d.getMonth()]} ${e._d.getFullYear()}` : 'Date to be announced'
      if (!(label in index)) { index[label] = groups.length; groups.push({ label, items: [] }) }
      groups[index[label]].items.push(e)
    })
    return groups
  }, [sorted])

  // Default the calendar to the first upcoming event's month.
  useEffect(() => {
    const next = sorted.find(e => e._d && e._d >= new Date(new Date().toDateString()))
    if (next?._d) setCalCursor(new Date(next._d.getFullYear(), next._d.getMonth(), 1))
    else if (sorted[0]?._d) setCalCursor(new Date(sorted[0]._d.getFullYear(), sorted[0]._d.getMonth(), 1))
  }, [sorted.length])

  // Build the visible month grid.
  const calGrid = useMemo(() => {
    const year = calCursor.getFullYear()
    const month = calCursor.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
  }, [calCursor])

  const shiftMonth = (delta) => setCalCursor(c => new Date(c.getFullYear(), c.getMonth() + delta, 1))

  const onPickDay = (date) => {
    const k = dayKey(date)
    if (!eventsByDay[k]) return
    setSelectedDay(k)
    const first = sorted.find(e => e._d && dayKey(e._d) === k)
    if (first) {
      const el = cardRefs.current[first._id || first.id]
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const today = new Date()
  const todayKey = dayKey(today)

  const formatTime = (d) => {
    if (!d) return null
    const h = d.getHours(), m = d.getMinutes()
    if (h === 0 && m === 0) return null // date-only, no meaningful time
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen py-xl px-lg max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center mb-xl">
        <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-pill bg-accent-purple/10 border border-accent-purple/25 text-accent-purple text-[0.85rem] font-semibold mb-md">
          <CalendarDays size={16} /> What's on
        </span>
        <h1 className="text-[2.6rem] max-md:text-[2rem] mb-sm text-primary font-bold tracking-[-0.02em]">Events & Specials</h1>
        <p className="text-[1.05rem] text-secondary max-w-[600px] mx-auto">Food festivals, special menus, and culinary experiences across Aurangabad — laid out by date.</p>
      </div>

      {loading ? (
        <div className="text-secondary py-xl text-center">Loading events…</div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[5rem] gap-3 text-secondary">
          <Calendar size={48} className="opacity-30" />
          <p className="m-0">No events scheduled yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-[320px_1fr] max-lg:grid-cols-1 gap-xl items-start">

          {/* ── Calendar (sticky on desktop) ── */}
          <div className="lg:sticky lg:top-[5rem]">
            <div className="bg-glass-surface border border-glass-border rounded-2xl p-5 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[1.05rem] font-bold text-primary m-0">
                  {MONTHS[calCursor.getMonth()]} {calCursor.getFullYear()}
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => shiftMonth(-1)} aria-label="Previous month"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:bg-glass-hover hover:text-primary transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => shiftMonth(1)} aria-label="Next month"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:bg-glass-hover hover:text-primary transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map(w => (
                  <div key={w} className="text-center text-[0.68rem] font-semibold uppercase tracking-wide text-tertiary py-1">{w[0]}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calGrid.map((date, i) => {
                  if (!date) return <div key={`b${i}`} />
                  const k = dayKey(date)
                  const has = eventsByDay[k]
                  const isToday = k === todayKey
                  const isSel = k === selectedDay
                  return (
                    <button
                      key={k}
                      onClick={() => onPickDay(date)}
                      disabled={!has}
                      className={`relative aspect-square flex items-center justify-center rounded-lg text-[0.85rem] transition-all
                        ${isSel ? 'bg-accent-purple text-white font-bold'
                          : has ? 'bg-accent-purple/10 text-primary font-semibold hover:bg-accent-purple/20 cursor-pointer'
                          : 'text-tertiary cursor-default'}
                        ${isToday && !isSel ? 'ring-1 ring-accent-purple/50' : ''}`}
                    >
                      {date.getDate()}
                      {has && !isSel && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-purple" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-glass-border text-[0.72rem] text-tertiary">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-purple" /> Has events</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full ring-1 ring-accent-purple/50" /> Today</span>
              </div>
            </div>
          </div>

          {/* ── Agenda ── */}
          <div className="flex flex-col gap-xl min-w-0">
            {grouped.map(group => (
              <div key={group.label}>
                <h3 className="text-[0.85rem] font-bold uppercase tracking-[0.1em] text-tertiary mb-md sticky top-0 bg-background-primary/80 backdrop-blur-sm py-1 z-[5]">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-md">
                  {group.items.map((event, index) => {
                    const id = event._id || event.id
                    const d = event._d
                    const time = formatTime(d)
                    const isPast = d && d < new Date(new Date().toDateString())
                    return (
                      <motion.div
                        key={id}
                        ref={el => (cardRefs.current[id] = el)}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
                        onClick={() => setSelectedEvent(event)}
                        className={`group flex gap-md p-3 bg-glass-surface border rounded-2xl cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-accent-purple/40 hover:shadow-glass
                          ${selectedDay && d && dayKey(d) === selectedDay ? 'border-accent-purple shadow-glow' : 'border-glass-border'}`}
                      >
                        {/* Date chip */}
                        <div className={`shrink-0 w-[68px] flex flex-col items-center justify-center rounded-xl py-2 text-center ${isPast ? 'bg-white/5 text-tertiary' : 'bg-accent-purple/12 text-accent-purple'}`}>
                          {d ? (
                            <>
                              <span className="text-[0.65rem] font-semibold uppercase tracking-wide">{WEEKDAYS[d.getDay()]}</span>
                              <span className="text-[1.6rem] font-extrabold leading-none my-0.5 text-primary">{d.getDate()}</span>
                              <span className="text-[0.65rem] font-semibold uppercase">{MONTHS_SHORT[d.getMonth()]}</span>
                            </>
                          ) : (
                            <Calendar size={22} className="opacity-50" />
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="shrink-0 w-[88px] h-[88px] max-sm:hidden rounded-xl overflow-hidden bg-black/20">
                          <img src={event.image} alt={eventName(event)} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.style.opacity = '0' }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[1.05rem] font-bold text-primary m-0 leading-tight truncate">{eventName(event)}</h4>
                            {event.status && event.status !== 'upcoming' && (
                              <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${event.status === 'past' ? 'bg-white/10 text-tertiary' : 'bg-amber-500/15 text-amber-400'}`}>{event.status}</span>
                            )}
                            {event.featured && <span className="text-[0.62rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-accent-purple/15 text-accent-purple">Featured</span>}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap text-[0.8rem] text-secondary">
                            {time && <span className="flex items-center gap-1"><Clock size={12} /> {time}</span>}
                            {event.location && <span className="flex items-center gap-1 truncate"><MapPin size={12} /> {event.location}</span>}
                            {event.price && <span className="flex items-center gap-1"><Ticket size={12} /> {event.price}</span>}
                          </div>
                          <p className="text-[0.82rem] text-tertiary leading-[1.5] m-0 line-clamp-2 max-sm:hidden">{event.description}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-end md:items-center justify-center z-[1000] md:p-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              className="relative w-full md:max-w-[640px] max-h-[92vh] bg-background-primary border border-glass-border rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
              initial={{ y: '100%', opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[240px] shrink-0 overflow-hidden">
                <img src={selectedEvent.image} alt={eventName(selectedEvent)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <button onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white hover:bg-black/75 transition-all">
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="text-[1.6rem] text-white font-bold m-0 leading-tight drop-shadow">{eventName(selectedEvent)}</h3>
                </div>
              </div>
              <div className="p-5 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEvent._d && (
                    <span className="flex items-center gap-1.5 py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.82rem] text-secondary">
                      <Calendar size={14} className="text-accent-purple" />
                      {selectedEvent._d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                      {formatTime(selectedEvent._d) && ` · ${formatTime(selectedEvent._d)}`}
                    </span>
                  )}
                  {selectedEvent.location && (
                    <span className="flex items-center gap-1.5 py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.82rem] text-secondary">
                      <MapPin size={14} className="text-accent-purple" /> {selectedEvent.location}
                    </span>
                  )}
                  {selectedEvent.price && (
                    <span className="flex items-center gap-1.5 py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.82rem] text-secondary">
                      <Ticket size={14} className="text-accent-purple" /> {selectedEvent.price}
                    </span>
                  )}
                  {selectedEvent.capacity > 0 && (
                    <span className="flex items-center gap-1.5 py-1.5 px-3 bg-glass-surface border border-glass-border rounded-pill text-[0.82rem] text-secondary">
                      <Users size={14} className="text-accent-purple" /> {selectedEvent.capacity} seats
                    </span>
                  )}
                </div>
                {selectedEvent.organizer && (
                  <p className="text-[0.82rem] text-tertiary m-0 mb-3">Organised by <span className="text-secondary font-semibold">{selectedEvent.organizer}</span></p>
                )}
                <p className="text-secondary m-0 leading-[1.7]">{selectedEvent.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Events
