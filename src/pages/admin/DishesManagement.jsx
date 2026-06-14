import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Loader, Search, UtensilsCrossed, X, Save, Upload, Link as LinkIcon } from 'lucide-react'
import { dishesApi, hotelsApi, mediaApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'

const EMPTY = { name: '', image: '', category: '', restaurantId: '' }

const DishesManagement = () => {
  const [dishes, setDishes] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [restaurantFilter, setRestaurantFilter] = useState('all')
  const [editor, setEditor] = useState({ open: false, dish: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, dish: null })
  const [imageMode, setImageMode] = useState('upload') // 'upload' | 'url'
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [dishRes, restRes] = await Promise.all([dishesApi.getAll(), hotelsApi.getAll()])
      const dishData = dishRes.data || dishRes
      const restData = restRes.data || restRes
      setDishes(Array.isArray(dishData) ? dishData : [])
      setRestaurants(Array.isArray(restData) ? restData : [])
    } catch {
      showToast.error('Error', 'Failed to load dishes')
    } finally {
      setLoading(false)
    }
  }

  const restaurantName = (rid) => {
    const r = restaurants.find(x => (x._id || x.id) === rid)
    return r ? r.name : 'Unknown restaurant'
  }

  const openEditor = (dish = null) => {
    setForm(dish
      ? { name: dish.name || '', image: dish.image || '', category: dish.category || '', restaurantId: dish.restaurantId || '' }
      : EMPTY)
    setImageMode('upload')
    setEditor({ open: true, dish })
  }

  const closeEditor = () => { setEditor({ open: false, dish: null }); setForm(EMPTY); setUploading(false) }

  const handleImageFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast.error('Invalid file', 'Please choose an image'); return }
    setUploading(true)
    try {
      const res = await mediaApi.upload(file)
      const url = res?.url || res?.data?.url || res?.media?.url
      if (!url) throw new Error('no url')
      setForm(f => ({ ...f, image: url }))
      showToast.success('Uploaded', 'Image uploaded')
    } catch {
      showToast.error('Upload failed', 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.restaurantId) { showToast.error('Validation', 'Pick a restaurant for this dish'); return }
    if (!form.image) { showToast.error('Validation', 'Add a dish image (upload a file or paste a URL)'); return }
    setSaving(true)
    try {
      if (editor.dish) {
        const res = await dishesApi.update(editor.dish._id || editor.dish.id, form)
        const updated = res.data || res
        setDishes(prev => prev.map(d => (d._id || d.id) === (editor.dish._id || editor.dish.id) ? updated : d))
        showToast.success('Success', 'Dish updated')
      } else {
        const res = await dishesApi.create(form)
        const created = res.data || res
        setDishes(prev => [created, ...prev])
        showToast.success('Success', 'Dish created')
      }
      closeEditor()
    } catch {
      showToast.error('Error', 'Failed to save dish')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dish) => {
    const dishId = dish._id || dish.id
    try {
      await dishesApi.delete(dishId)
      setDishes(prev => prev.filter(d => (d._id || d.id) !== dishId))
      showToast.success('Success', `${dish.name} has been deleted`)
    } catch {
      showToast.error('Error', 'Failed to delete dish')
    }
  }

  const filtered = dishes.filter(d => {
    const matchesSearch = (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.category || '').toLowerCase().includes(search.toLowerCase())
    const matchesRestaurant = restaurantFilter === 'all' || d.restaurantId === restaurantFilter
    return matchesSearch && matchesRestaurant
  })

  const inputCls = "bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[0.95rem] transition-all focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Dishes</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Signature dishes tied to a restaurant</p>
        </div>
        <button onClick={() => openEditor()} className="inline-flex items-center gap-1.5 py-2 px-6 bg-gradient-to-br from-purple-500 to-[#9b59b6] border-none rounded-lg text-white font-semibold cursor-pointer transition-all hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(138,43,226,0.2)]">
          <Plus size={20} /> Add Dish
        </button>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap max-md:flex-col">
        <div className="relative flex-1 min-w-[260px] max-md:min-w-0">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search dishes..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2 px-4 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all focus:border-purple-500 placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900" />
        </div>
        <select value={restaurantFilter} onChange={e => setRestaurantFilter(e.target.value)}
          className="py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900">
          <option value="all">All Restaurants</option>
          {restaurants.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0">Loading dishes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px] text-center text-gray-500">
          <div>
            <UtensilsCrossed size={48} className="mx-auto mb-4" />
            <h3 className="text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold">No dishes found</h3>
            <p className="m-0">Add a dish or adjust your filters</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 max-md:grid-cols-2 max-[480px]:grid-cols-1">
          {filtered.map((dish, index) => {
            const dishId = dish._id || dish.id
            return (
              <motion.div key={dishId}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all hover:-translate-y-1 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 group"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.03 }}>
                <div className="relative h-[150px] overflow-hidden bg-black/20">
                  {dish.image
                    ? <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-600"><UtensilsCrossed size={32} /></div>}
                  {dish.category && <span className="absolute top-2 left-2 py-1 px-2 rounded bg-black/60 text-white text-[0.7rem] font-semibold">{dish.category}</span>}
                </div>
                <div className="p-4">
                  <h3 className="text-[1rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900 truncate">{dish.name}</h3>
                  <p className="text-gray-500 text-[0.8rem] m-0 mb-3 truncate">{restaurantName(dish.restaurantId)}</p>
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => openEditor(dish)} title="Edit"
                      className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 cursor-pointer transition-all hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:border-black/10">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => setDeleteModal({ isOpen: true, dish })} title="Delete"
                      className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-md bg-transparent text-gray-500 cursor-pointer transition-all hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 data-[theme=light]:border-black/10">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      <AnimatePresence>
        {editor.open && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) closeEditor() }}>
            <motion.form onSubmit={handleSave}
              className="w-full max-w-[460px] bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 data-[theme=light]:bg-white"
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between">
                <h3 className="text-[1.2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">{editor.dish ? 'Edit Dish' : 'Add Dish'}</h3>
                <button type="button" onClick={closeEditor} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] text-gray-400">Dish Name *</label>
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Mutton Biryani" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] text-gray-400">Category *</label>
                <input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required placeholder="e.g. Main Course" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] text-gray-400">Dish Image *</label>
                <div className="flex gap-1 p-1 bg-black/30 border border-white/10 rounded-xl w-fit">
                  <button type="button" onClick={() => setImageMode('upload')}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[0.8rem] font-medium transition-all ${imageMode === 'upload' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Upload size={14} /> Upload
                  </button>
                  <button type="button" onClick={() => setImageMode('url')}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[0.8rem] font-medium transition-all ${imageMode === 'url' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <LinkIcon size={14} /> Paste URL
                  </button>
                </div>

                {imageMode === 'upload' ? (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => handleImageFile(e.target.files?.[0])} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="flex items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-white/15 rounded-xl text-gray-400 hover:border-purple-500 hover:text-white transition-all disabled:opacity-60">
                      {uploading ? <><Loader size={18} className="animate-spin" /> Uploading…</> : <><Upload size={18} /> Choose an image file</>}
                    </button>
                  </>
                ) : (
                  <input className={inputCls} type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
                )}

                {form.image && <img src={form.image} alt="" className="mt-1 h-28 w-full object-cover rounded-lg" onError={e => { e.currentTarget.style.display = 'none' }} />}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] text-gray-400">Restaurant *</label>
                <select className={inputCls} value={form.restaurantId} onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value }))} required>
                  <option value="">Select a restaurant…</option>
                  {restaurants.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditor} className="py-2.5 px-5 rounded-xl font-semibold cursor-pointer bg-transparent text-gray-400 border border-white/10 transition-all hover:bg-white/5 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 py-2.5 px-5 rounded-xl font-semibold cursor-pointer bg-purple-500 text-white border-none transition-all hover:bg-purple-600 disabled:opacity-70">
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  {editor.dish ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, dish: null })}
        onConfirm={() => { if (deleteModal.dish) handleDelete(deleteModal.dish) }}
        title="Delete Dish"
        message={`Are you sure you want to delete "${deleteModal.dish?.name}"? This action cannot be undone.`}
        confirmText="Delete" cancelText="Cancel" type="danger"
      />
    </div>
  )
}

export default DishesManagement
