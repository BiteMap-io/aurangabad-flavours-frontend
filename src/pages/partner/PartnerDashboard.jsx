import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Loader, Store, LogOut, Clock, CheckCircle2, XCircle, Pencil, UtensilsCrossed, Tag, Share2 } from 'lucide-react'
import { hotelsApi } from '../../services/adminApi'
import { useUserAuth } from '../../context/UserAuthContext'
import { showToast } from '../../components/admin/Toast'

const STATUS_META = {
  pending: { label: 'Pending Review', icon: Clock, cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Live', icon: CheckCircle2, cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  rejected: { label: 'Rejected', icon: XCircle, cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

const PartnerDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useUserAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await hotelsApi.getMine()
      const data = res.data || res
      setRestaurants(Array.isArray(data) ? data : [])
    } catch {
      showToast.error('Error', 'Failed to load your restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/partner')
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <header className="border-b border-glass-border bg-glass-surface backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-md md:px-lg py-md flex items-center justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-md bg-accent-purple/15 flex items-center justify-center text-accent-purple">
              <Store size={20} />
            </div>
            <div>
              <h1 className="text-[1.1rem] font-bold text-primary m-0">Partner Dashboard</h1>
              <p className="text-secondary text-[0.8rem] m-0">{user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 py-2 px-3 bg-transparent border border-glass-border rounded-md text-secondary text-[0.85rem] cursor-pointer hover:text-primary hover:bg-glass-hover transition-all">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-md md:px-lg py-lg">
        <div className="flex items-center justify-between mb-lg flex-wrap gap-sm">
          <div>
            <h2 className="text-[1.5rem] font-bold text-primary m-0 mb-1">Your Restaurants</h2>
            <p className="text-secondary text-[0.9rem] m-0">Manage listings, dishes, menus and offers</p>
          </div>
          <Link to="/partner/hotels/new" className="inline-flex items-center gap-1.5 py-2 px-md bg-accent-purple rounded-pill text-white text-[0.9rem] font-semibold no-underline hover:bg-accent-purple/90 hover:shadow-glow transition-all">
            <Plus size={18} /> Add Restaurant
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-secondary">
            <Loader size={40} className="animate-spin mb-4 text-accent-purple" />
            <p className="m-0">Loading your restaurants...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] text-center border border-dashed border-glass-border rounded-md p-lg">
            <Store size={40} className="text-secondary opacity-50 mb-3" />
            <h3 className="text-primary font-semibold m-0 mb-1">No restaurants yet</h3>
            <p className="text-secondary text-[0.9rem] m-0 mb-md">Add your first restaurant to get started — it'll go live after a quick review.</p>
            <Link to="/partner/hotels/new" className="inline-flex items-center gap-1.5 py-2 px-md bg-accent-purple rounded-pill text-white text-[0.9rem] font-semibold no-underline">
              <Plus size={16} /> Add Restaurant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {restaurants.map((r, i) => {
              const id = r._id || r.id
              const status = STATUS_META[r.approvalStatus] || STATUS_META.approved
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="bg-glass-surface border border-glass-border rounded-md overflow-hidden"
                >
                  <div className="relative h-[140px] bg-black/20">
                    {r.image
                      ? <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-secondary"><Store size={28} /></div>}
                    <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-pill text-[0.72rem] font-semibold border ${status.cls}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                  </div>
                  <div className="p-md">
                    <h3 className="text-primary font-semibold text-[1.05rem] m-0 mb-1 truncate">{r.name}</h3>
                    <p className="text-secondary text-[0.85rem] m-0 mb-3 truncate">{r.cuisine} · {r.area}</p>

                    {r.approvalStatus === 'rejected' && r.rejectionReason && (
                      <p className="text-red-400 text-[0.8rem] bg-red-500/10 border border-red-500/20 rounded-md p-2 mb-3">
                        {r.rejectionReason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Link to={`/partner/hotels/${id}/edit`} className="flex items-center gap-1 py-1.5 px-3 bg-glass-hover border border-glass-border rounded-md text-primary text-[0.8rem] no-underline hover:border-accent-purple/40 transition-all">
                        <Pencil size={13} /> Edit
                      </Link>
                      <Link to={`/partner/hotels/${id}/manage?tab=dishes`} className="flex items-center gap-1 py-1.5 px-3 bg-glass-hover border border-glass-border rounded-md text-primary text-[0.8rem] no-underline hover:border-accent-purple/40 transition-all">
                        <UtensilsCrossed size={13} /> Dishes
                      </Link>
                      <Link to={`/partner/hotels/${id}/manage?tab=offers`} className="flex items-center gap-1 py-1.5 px-3 bg-glass-hover border border-glass-border rounded-md text-primary text-[0.8rem] no-underline hover:border-accent-purple/40 transition-all">
                        <Tag size={13} /> Offers
                      </Link>
                      {r.approvalStatus === 'approved' && (
                        <Link to={`/place/${id}`} className="flex items-center gap-1 py-1.5 px-3 bg-glass-hover border border-glass-border rounded-md text-primary text-[0.8rem] no-underline hover:border-accent-purple/40 transition-all">
                          <Share2 size={13} /> View
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default PartnerDashboard
