import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Loader, Route, Clock, MapPin } from 'lucide-react'
import { foodTrailsApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'

const FoodTrailsManagement = () => {
  const [trails, setTrails] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, trail: null })

  useEffect(() => { loadTrails() }, [])

  const loadTrails = async () => {
    try {
      setLoading(true)
      const response = await foodTrailsApi.getAll()
      const data = response.data || response
      setTrails(Array.isArray(data) ? data : [])
    } catch {
      showToast.error('Error', 'Failed to load food trails')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (trail) => {
    const trailId = trail._id || trail.id
    try {
      await foodTrailsApi.delete(trailId)
      setTrails(prev => prev.filter(t => (t._id || t.id) !== trailId))
      showToast.success('Success', `${trail.name} has been deleted`)
    } catch {
      showToast.error('Error', 'Failed to delete food trail')
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Food Trails</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Curated routes that string restaurants into a themed crawl</p>
        </div>
        <Link to="/admin/food-trails/add" className="inline-flex items-center gap-1.5 py-2 px-6 bg-gradient-to-br from-purple-500 to-[#9b59b6] border-none rounded-lg text-white no-underline font-semibold transition-all duration-300 hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(138,43,226,0.2)]">
          <Plus size={20} /> Add Food Trail
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0">Loading food trails...</p>
        </div>
      ) : trails.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px] text-center text-gray-500">
          <div>
            <Route size={48} className="mx-auto mb-4" />
            <h3 className="text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold">No food trails yet</h3>
            <p className="m-0">Create your first themed food route</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
          {trails.map((trail, index) => {
            const trailId = trail._id || trail.id
            return (
              <motion.div key={trailId}
                className="bg-white/5 border border-white/10 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: (trail.color || '#a855f7') + '22' }}>
                    {trail.icon || '🍽️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[1.1rem] font-semibold text-gray-100 m-0 data-[theme=light]:text-gray-900 truncate">{trail.name}</h3>
                    <div className="flex items-center gap-3 text-[0.8rem] text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Clock size={13} /> {trail.estimatedTime || '—'}</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {(trail.restaurantsId || []).length} stops</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-[0.88rem] m-0 mb-4 leading-[1.5] line-clamp-3">{trail.description}</p>
                <div className="flex gap-1.5 justify-end">
                  <Link to={`/admin/food-trails/edit/${trailId}`}
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 transition-all no-underline hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:border-black/10">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => setDeleteModal({ isOpen: true, trail })}
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent text-gray-500 cursor-pointer transition-all hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 data-[theme=light]:border-black/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, trail: null })}
        onConfirm={() => { if (deleteModal.trail) handleDelete(deleteModal.trail) }}
        title="Delete Food Trail"
        message={`Are you sure you want to delete "${deleteModal.trail?.name}"? This action cannot be undone.`}
        confirmText="Delete" cancelText="Cancel" type="danger"
      />
    </div>
  )
}

export default FoodTrailsManagement
