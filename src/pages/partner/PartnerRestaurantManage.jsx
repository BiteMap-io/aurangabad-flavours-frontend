import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader, Save, X, UtensilsCrossed, Tag,
  Upload, Link as LinkIcon, Camera, ChevronDown, Sparkles,
} from 'lucide-react'
import { hotelsApi, dishesApi, offersApi, mediaApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'

const inputCls = 'w-full bg-glass-surface border border-glass-border rounded-md py-2.5 px-3.5 text-primary text-[0.9rem] focus:outline-none focus:border-accent-purple transition-all'
const labelCls = 'text-[0.82rem] text-secondary font-medium mb-1 block'

// ── Food photography tips (guides owners toward better dish photos) ──────────
const PhotoTipsPanel = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-glass-border rounded-md overflow-hidden mb-md">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-glass-surface text-left cursor-pointer">
        <span className="flex items-center gap-2 text-primary text-[0.88rem] font-semibold">
          <Camera size={16} className="text-accent-purple" /> Tips for great food photos
        </span>
        <ChevronDown size={16} className={`text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <ul className="p-3 pt-0 m-0 list-none flex flex-col gap-2 text-[0.85rem] text-secondary">
              <li className="flex gap-2"><Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" /> Use natural daylight near a window — avoid harsh yellow indoor lighting.</li>
              <li className="flex gap-2"><Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" /> Shoot from a 45° angle or straight overhead ("top shot") for plated dishes.</li>
              <li className="flex gap-2"><Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" /> Use a plain plate and an uncluttered background — let the dish be the focus.</li>
              <li className="flex gap-2"><Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" /> Fill the frame with the dish; get close instead of cropping later.</li>
              <li className="flex gap-2"><Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" /> Wipe the plate rim clean and add a garnish for a fresh, appetizing look.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Dish image upload-or-URL field (shared shape with admin DishesManagement) ─
const DishImageField = ({ value, onChange }) => {
  const [mode, setMode] = useState('upload')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast.error('Invalid file', 'Please choose an image'); return }
    setUploading(true)
    try {
      const res = await mediaApi.upload(file)
      const url = res?.url || res?.data?.url || res?.media?.url
      if (!url) throw new Error('no url')
      onChange(url)
    } catch {
      showToast.error('Upload failed', 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 p-1 bg-glass-surface border border-glass-border rounded-md w-fit">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-[0.78rem] font-medium transition-all ${mode === 'upload' ? 'bg-accent-purple text-white' : 'text-secondary'}`}>
          <Upload size={13} /> Upload
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-[0.78rem] font-medium transition-all ${mode === 'url' ? 'bg-accent-purple text-white' : 'text-secondary'}`}>
          <LinkIcon size={13} /> URL
        </button>
      </div>
      {mode === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center justify-center gap-2 py-4 px-4 border-2 border-dashed border-glass-border rounded-md text-secondary hover:border-accent-purple/50 transition-all disabled:opacity-60">
            {uploading ? <><Loader size={16} className="animate-spin" /> Uploading…</> : <><Upload size={16} /> Choose an image</>}
          </button>
        </>
      ) : (
        <input className={inputCls} type="url" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." />
      )}
      {value && <img src={value} alt="" className="h-24 w-full object-cover rounded-md" onError={e => { e.currentTarget.style.display = 'none' }} />}
    </div>
  )
}

// ── Dishes tab ────────────────────────────────────────────────────────────────
const DishesTab = ({ restaurantId }) => {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState({ open: false, dish: null })
  const [form, setForm] = useState({ name: '', category: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, dish: null })

  useEffect(() => { load() }, [restaurantId])

  const load = async () => {
    try {
      setLoading(true)
      const res = await dishesApi.getByRestaurant(restaurantId)
      const data = res.data || res
      setDishes(Array.isArray(data) ? data : [])
    } catch {
      showToast.error('Error', 'Failed to load dishes')
    } finally {
      setLoading(false)
    }
  }

  const openEditor = (dish = null) => {
    setForm(dish ? { name: dish.name || '', category: dish.category || '', image: dish.image || '' } : { name: '', category: '', image: '' })
    setEditor({ open: true, dish })
  }
  const closeEditor = () => setEditor({ open: false, dish: null })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.image) { showToast.error('Validation', 'Add a dish image'); return }
    setSaving(true)
    try {
      const payload = { ...form, restaurantId }
      if (editor.dish) {
        const id = editor.dish._id || editor.dish.id
        const res = await dishesApi.update(id, payload)
        const updated = res.data || res
        setDishes(prev => prev.map(d => (d._id || d.id) === id ? updated : d))
        showToast.success('Success', 'Dish updated')
      } else {
        const res = await dishesApi.create(payload)
        const created = res.data || res
        setDishes(prev => [created, ...prev])
        showToast.success('Success', 'Dish added')
      }
      closeEditor()
    } catch {
      showToast.error('Error', 'Failed to save dish')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dish) => {
    const id = dish._id || dish.id
    try {
      await dishesApi.delete(id)
      setDishes(prev => prev.filter(d => (d._id || d.id) !== id))
      showToast.success('Success', 'Dish removed')
    } catch {
      showToast.error('Error', 'Failed to remove dish')
    }
  }

  return (
    <div>
      <PhotoTipsPanel />
      <div className="flex justify-end mb-md">
        <button onClick={() => openEditor()} className="inline-flex items-center gap-1.5 py-2 px-4 bg-accent-purple rounded-pill text-white text-[0.85rem] font-semibold hover:bg-accent-purple/90 transition-all">
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-lg"><Loader size={32} className="animate-spin text-accent-purple" /></div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-lg border border-dashed border-glass-border rounded-md">
          <UtensilsCrossed size={32} className="text-secondary opacity-50 mx-auto mb-2" />
          <p className="text-secondary text-[0.9rem] m-0">No dishes added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
          {dishes.map(dish => {
            const id = dish._id || dish.id
            return (
              <div key={id} className="bg-glass-surface border border-glass-border rounded-md overflow-hidden">
                <div className="h-[100px] bg-black/20">
                  {dish.image
                    ? <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-secondary"><UtensilsCrossed size={22} /></div>}
                </div>
                <div className="p-2.5">
                  <p className="text-primary text-[0.85rem] font-semibold m-0 truncate">{dish.name}</p>
                  <p className="text-secondary text-[0.75rem] m-0 mb-2 truncate">{dish.category}</p>
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => openEditor(dish)} className="w-7 h-7 flex items-center justify-center border border-glass-border rounded text-secondary hover:text-accent-purple transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteModal({ isOpen: true, dish })} className="w-7 h-7 flex items-center justify-center border border-glass-border rounded text-secondary hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {editor.open && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) closeEditor() }}>
            <motion.form onSubmit={handleSave}
              className="w-full max-w-[420px] bg-background-primary border border-glass-border rounded-md p-lg flex flex-col gap-3"
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[1.1rem] font-bold text-primary m-0">{editor.dish ? 'Edit Dish' : 'Add Dish'}</h3>
                <button type="button" onClick={closeEditor} className="text-secondary hover:text-primary bg-transparent border-none cursor-pointer"><X size={18} /></button>
              </div>
              <div>
                <label className={labelCls}>Dish name</label>
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Mutton Biryani" />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required placeholder="e.g. Main Course" />
              </div>
              <div>
                <label className={labelCls}>Photo</label>
                <DishImageField value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeEditor} className="py-2 px-4 rounded-pill text-secondary border border-glass-border bg-transparent cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 py-2 px-4 rounded-pill bg-accent-purple text-white font-semibold border-none cursor-pointer disabled:opacity-70">
                  {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Save
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
        title="Remove Dish"
        message={`Remove "${deleteModal.dish?.name}"?`}
        confirmText="Remove" cancelText="Cancel" type="danger"
      />
    </div>
  )
}

// ── Offers tab ────────────────────────────────────────────────────────────────
const EMPTY_OFFER = {
  title: '', description: '', startDate: '', endDate: '', startTime: '', endTime: '',
  tiers: [{ minSpend: 1000, discountPercent: 10 }], audience: 'all', active: true,
}

const OffersTab = ({ restaurantId }) => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState({ open: false, offer: null })
  const [form, setForm] = useState(EMPTY_OFFER)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, offer: null })

  useEffect(() => { load() }, [restaurantId])

  const load = async () => {
    try {
      setLoading(true)
      const res = await offersApi.getByRestaurant(restaurantId)
      const data = res.data || res
      setOffers(Array.isArray(data) ? data : [])
    } catch {
      showToast.error('Error', 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  const openEditor = (offer = null) => {
    if (offer) {
      setForm({
        title: offer.title || '', description: offer.description || '',
        startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
        endDate: offer.endDate ? offer.endDate.slice(0, 10) : '',
        startTime: offer.startTime || '', endTime: offer.endTime || '',
        tiers: offer.tiers?.length ? offer.tiers : [{ minSpend: 1000, discountPercent: 10 }],
        audience: offer.audience || 'all', active: offer.active !== false,
      })
    } else {
      setForm(EMPTY_OFFER)
    }
    setEditor({ open: true, offer })
  }
  const closeEditor = () => setEditor({ open: false, offer: null })

  const updateTier = (i, field, value) => {
    setForm(f => ({ ...f, tiers: f.tiers.map((t, idx) => idx === i ? { ...t, [field]: Number(value) || 0 } : t) }))
  }
  const addTier = () => setForm(f => ({ ...f, tiers: [...f.tiers, { minSpend: 0, discountPercent: 0 }] }))
  const removeTier = (i) => setForm(f => ({ ...f, tiers: f.tiers.filter((_, idx) => idx !== i) }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.startDate || !form.endDate) { showToast.error('Validation', 'Set a start and end date'); return }
    setSaving(true)
    try {
      const payload = { ...form, restaurantId }
      if (editor.offer) {
        const id = editor.offer._id || editor.offer.id
        const res = await offersApi.update(id, payload)
        const updated = res.data || res
        setOffers(prev => prev.map(o => (o._id || o.id) === id ? updated : o))
        showToast.success('Success', 'Offer updated')
      } else {
        const res = await offersApi.create(payload)
        const created = res.data || res
        setOffers(prev => [created, ...prev])
        showToast.success('Success', 'Offer created')
      }
      closeEditor()
    } catch {
      showToast.error('Error', 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (offer) => {
    const id = offer._id || offer.id
    try {
      await offersApi.delete(id)
      setOffers(prev => prev.filter(o => (o._id || o.id) !== id))
      showToast.success('Success', 'Offer removed')
    } catch {
      showToast.error('Error', 'Failed to remove offer')
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-md">
        <button onClick={() => openEditor()} className="inline-flex items-center gap-1.5 py-2 px-4 bg-accent-purple rounded-pill text-white text-[0.85rem] font-semibold hover:bg-accent-purple/90 transition-all">
          <Plus size={16} /> Add Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-lg"><Loader size={32} className="animate-spin text-accent-purple" /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-lg border border-dashed border-glass-border rounded-md">
          <Tag size={32} className="text-secondary opacity-50 mx-auto mb-2" />
          <p className="text-secondary text-[0.9rem] m-0">No offers yet — attract diners with a spend-based discount or a student deal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {offers.map(offer => {
            const id = offer._id || offer.id
            return (
              <div key={id} className="bg-glass-surface border border-glass-border rounded-md p-md flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-primary font-semibold text-[0.95rem] m-0">{offer.title}</h4>
                    {offer.audience === 'student' && <span className="px-2 py-0.5 rounded-pill text-[0.7rem] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">Student Offer</span>}
                    {!offer.active && <span className="px-2 py-0.5 rounded-pill text-[0.7rem] font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">Inactive</span>}
                  </div>
                  <p className="text-secondary text-[0.8rem] m-0 mb-1">
                    {new Date(offer.startDate).toLocaleDateString()} – {new Date(offer.endDate).toLocaleDateString()}
                    {offer.startTime && ` · ${offer.startTime}–${offer.endTime || ''}`}
                  </p>
                  <p className="text-secondary text-[0.82rem] m-0">
                    {offer.tiers?.map(t => `₹${t.minSpend}+ → ${t.discountPercent}% off`).join('  ·  ')}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEditor(offer)} className="w-8 h-8 flex items-center justify-center border border-glass-border rounded text-secondary hover:text-accent-purple transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteModal({ isOpen: true, offer })} className="w-8 h-8 flex items-center justify-center border border-glass-border rounded text-secondary hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {editor.open && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) closeEditor() }}>
            <motion.form onSubmit={handleSave}
              className="w-full max-w-[480px] bg-background-primary border border-glass-border rounded-md p-lg flex flex-col gap-3 my-8"
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[1.1rem] font-bold text-primary m-0">{editor.offer ? 'Edit Offer' : 'Add Offer'}</h3>
                <button type="button" onClick={closeEditor} className="text-secondary hover:text-primary bg-transparent border-none cursor-pointer"><X size={18} /></button>
              </div>

              <div>
                <label className={labelCls}>Title</label>
                <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Weekend Student Special" />
              </div>
              <div>
                <label className={labelCls}>Description (optional)</label>
                <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Start date</label>
                  <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>End date</label>
                  <input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Start time (optional)</label>
                  <input type="time" className={inputCls} value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>End time (optional)</label>
                  <input type="time" className={inputCls} value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Who is this for?</label>
                <div className="flex gap-2">
                  {['all', 'student'].map(a => (
                    <button key={a} type="button" onClick={() => setForm(f => ({ ...f, audience: a }))}
                      className={`flex-1 py-2 rounded-md text-[0.85rem] font-medium border transition-all ${form.audience === a ? 'bg-accent-purple/15 border-accent-purple text-accent-purple' : 'bg-glass-surface border-glass-border text-secondary'}`}>
                      {a === 'all' ? 'Everyone' : 'Students only'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Discount tiers — minimum bill → % off</label>
                <div className="flex flex-col gap-2">
                  {form.tiers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-secondary text-[0.85rem]">₹</span>
                      <input type="number" min="0" className={inputCls} value={t.minSpend} onChange={e => updateTier(i, 'minSpend', e.target.value)} placeholder="1000" />
                      <span className="text-secondary text-[0.85rem]">→</span>
                      <input type="number" min="0" max="100" className={inputCls} value={t.discountPercent} onChange={e => updateTier(i, 'discountPercent', e.target.value)} placeholder="10" />
                      <span className="text-secondary text-[0.85rem]">%</span>
                      {form.tiers.length > 1 && (
                        <button type="button" onClick={() => removeTier(i)} className="text-secondary hover:text-red-400 bg-transparent border-none cursor-pointer"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addTier} className="self-start text-accent-purple text-[0.82rem] font-medium bg-transparent border-none cursor-pointer flex items-center gap-1">
                    <Plus size={13} /> Add another tier
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[0.85rem] text-secondary">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                Active (visible to diners)
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeEditor} className="py-2 px-4 rounded-pill text-secondary border border-glass-border bg-transparent cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 py-2 px-4 rounded-pill bg-accent-purple text-white font-semibold border-none cursor-pointer disabled:opacity-70">
                  {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, offer: null })}
        onConfirm={() => { if (deleteModal.offer) handleDelete(deleteModal.offer) }}
        title="Remove Offer"
        message={`Remove "${deleteModal.offer?.title}"?`}
        confirmText="Remove" cancelText="Cancel" type="danger"
      />
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
const PartnerRestaurantManage = () => {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurant, setRestaurant] = useState(null)
  const tab = searchParams.get('tab') === 'offers' ? 'offers' : 'dishes'

  useEffect(() => {
    hotelsApi.getById(id).then(res => setRestaurant(res.data || res)).catch(() => {})
  }, [id])

  return (
    <div className="min-h-screen bg-background-primary">
      <header className="border-b border-glass-border bg-glass-surface backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto px-md md:px-lg py-md">
          <Link to="/partner/dashboard" className="inline-flex items-center gap-1.5 text-accent-purple text-[0.85rem] font-medium no-underline mb-2">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
          <h1 className="text-[1.3rem] font-bold text-primary m-0">{restaurant?.name || 'Manage Restaurant'}</h1>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-md md:px-lg py-lg">
        <div className="flex gap-2 mb-lg border-b border-glass-border">
          <button onClick={() => setSearchParams({ tab: 'dishes' })}
            className={`flex items-center gap-2 py-2.5 px-4 text-[0.9rem] font-medium border-b-2 transition-all bg-transparent cursor-pointer ${tab === 'dishes' ? 'border-accent-purple text-accent-purple' : 'border-transparent text-secondary'}`}>
            <UtensilsCrossed size={15} /> Dishes
          </button>
          <button onClick={() => setSearchParams({ tab: 'offers' })}
            className={`flex items-center gap-2 py-2.5 px-4 text-[0.9rem] font-medium border-b-2 transition-all bg-transparent cursor-pointer ${tab === 'offers' ? 'border-accent-purple text-accent-purple' : 'border-transparent text-secondary'}`}>
            <Tag size={15} /> Offers
          </button>
        </div>

        {tab === 'dishes' ? <DishesTab restaurantId={id} /> : <OffersTab restaurantId={id} />}
      </main>
    </div>
  )
}

export default PartnerRestaurantManage
