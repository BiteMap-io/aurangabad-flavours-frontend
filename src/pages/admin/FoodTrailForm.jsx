import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader, Clock, Plus, X } from 'lucide-react'
import { foodTrailsApi, hotelsApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'

const ICON_CHOICES = ['🍽️', '🌶️', '🍮', '🍢', '🍛', '🥘', '☕', '🍰', '🥙', '🥟']
const COLOR_CHOICES = ['#a855f7', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']

const FoodTrailForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [restaurants, setRestaurants] = useState([])
  const [highlightInput, setHighlightInput] = useState('')
  const [formData, setFormData] = useState({
    name: '', description: '', icon: '🍽️', color: '#a855f7',
    estimatedTime: '', restaurantsId: [], highlights: [],
  })

  useEffect(() => {
    loadRestaurants()
    if (isEditMode) loadTrail()
  }, [id])

  const loadRestaurants = async () => {
    try {
      const res = await hotelsApi.getAll()
      const data = res.data || res
      setRestaurants(Array.isArray(data) ? data : [])
    } catch { /* non-fatal */ }
  }

  const loadTrail = async () => {
    try {
      setInitialLoading(true)
      const res = await foodTrailsApi.getById(id)
      const data = res.data || res
      if (data) {
        setFormData({
          name: data.name || '', description: data.description || '',
          icon: data.icon || '🍽️', color: data.color || '#a855f7',
          estimatedTime: data.estimatedTime || '',
          restaurantsId: data.restaurantsId || [], highlights: data.highlights || [],
        })
      }
    } catch {
      showToast.error('Error', 'Failed to load food trail')
      navigate('/admin/food-trails')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleRestaurant = (rid) => {
    setFormData(prev => ({
      ...prev,
      restaurantsId: prev.restaurantsId.includes(rid)
        ? prev.restaurantsId.filter(x => x !== rid)
        : [...prev.restaurantsId, rid],
    }))
  }

  const addHighlight = () => {
    const v = highlightInput.trim()
    if (!v) return
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, v] }))
    setHighlightInput('')
  }

  const removeHighlight = (i) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEditMode) {
        await foodTrailsApi.update(id, formData)
        showToast.success('Success', 'Food trail updated')
      } else {
        await foodTrailsApi.create(formData)
        showToast.success('Success', 'Food trail created')
      }
      navigate('/admin/food-trails')
    } catch {
      showToast.error('Error', isEditMode ? 'Failed to update food trail' : 'Failed to create food trail')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center h-[400px] font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <Loader size={48} className="animate-spin mb-4 text-purple-500" />
      <p className="m-0 text-gray-500">Loading food trail...</p>
    </div>
  )

  const inputCls = "bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"

  return (
    <div className="p-8 max-w-[1000px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex flex-col gap-4 mb-8">
        <button className="flex items-center gap-2 bg-transparent border-none text-purple-500 cursor-pointer font-medium w-fit p-0 transition-all hover:text-purple-400 hover:-translate-x-1" onClick={() => navigate('/admin/food-trails')}>
          <ArrowLeft size={20} /><span>Back to Food Trails</span>
        </button>
        <h1 className="text-[2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">{isEditMode ? 'Edit Food Trail' : 'Add Food Trail'}</h1>
      </div>

      <motion.div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <div className="flex flex-col gap-2">
              <label className="text-[0.9rem] text-gray-400 font-medium">Trail Name *</label>
              <input className={inputCls} name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Old City Spice Trail" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.9rem] text-gray-400 font-medium">Estimated Time *</label>
              <div className="relative flex items-center">
                <Clock size={16} className="absolute left-4 text-gray-400" />
                <input className={`${inputCls} w-full pl-[2.8rem]`} name="estimatedTime" value={formData.estimatedTime} onChange={handleChange} required placeholder="e.g. 3 hours" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] text-gray-400 font-medium">Description *</label>
            <textarea className={`${inputCls} resize-y min-h-[120px]`} name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="What's this trail about?" />
          </div>

          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <div className="flex flex-col gap-2">
              <label className="text-[0.9rem] text-gray-400 font-medium">Icon *</label>
              <div className="flex flex-wrap gap-2">
                {ICON_CHOICES.map(ic => (
                  <button type="button" key={ic} onClick={() => setFormData(p => ({ ...p, icon: ic }))}
                    className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition-all ${formData.icon === ic ? 'border-purple-500 bg-purple-500/15' : 'border-white/10 hover:bg-white/5'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.9rem] text-gray-400 font-medium">Accent Color *</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_CHOICES.map(col => (
                  <button type="button" key={col} onClick={() => setFormData(p => ({ ...p, color: col }))}
                    className={`w-11 h-11 rounded-xl border-2 transition-all ${formData.color === col ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: col }} />
                ))}
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] text-gray-400 font-medium">Highlights</label>
            <div className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={highlightInput} onChange={e => setHighlightInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight() } }}
                placeholder="e.g. Famous biryani stop" />
              <button type="button" onClick={addHighlight} className="px-4 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-400 transition-all hover:bg-purple-500/25">
                <Plus size={18} />
              </button>
            </div>
            {formData.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.highlights.map((h, i) => (
                  <span key={i} className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[0.82rem]">
                    {h}
                    <button type="button" onClick={() => removeHighlight(i)} className="text-gray-500 hover:text-red-400"><X size={13} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Restaurant stops */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] text-gray-400 font-medium">Restaurant Stops ({formData.restaurantsId.length} selected)</label>
            <div className="max-h-[240px] overflow-y-auto border border-white/10 rounded-xl p-2 flex flex-col gap-1 data-[theme=light]:border-black/10">
              {restaurants.length === 0 && <p className="text-gray-500 text-[0.85rem] p-2 m-0">No restaurants available.</p>}
              {restaurants.map(r => {
                const rid = r._id || r.id
                const selected = formData.restaurantsId.includes(rid)
                return (
                  <label key={rid} className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-all ${selected ? 'bg-purple-500/10' : 'hover:bg-white/5'}`}>
                    <input type="checkbox" checked={selected} onChange={() => toggleRestaurant(rid)} className="w-4 h-4 accent-purple-500" />
                    <span className="text-[0.88rem] text-gray-200 data-[theme=light]:text-gray-800">{r.name}</span>
                    <span className="text-[0.78rem] text-gray-500 ml-auto">{r.area}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10 data-[theme=light]:border-black/10">
            <button type="button" className="py-3 px-6 rounded-xl font-semibold cursor-pointer bg-transparent text-gray-400 border border-white/10 transition-all hover:bg-white/5 hover:text-white" onClick={() => navigate('/admin/food-trails')}>Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer bg-purple-500 text-white border-none transition-all hover:bg-purple-600 hover:-translate-y-[2px] disabled:opacity-70">
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditMode ? 'Update Trail' : 'Save Trail'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default FoodTrailForm
