import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Search,
  Trash2,
  Eye,
  Loader,
  X,
  Tag as TagIcon,
  Image as ImageIcon,
  ImagePlus
} from 'lucide-react'
import { galleryApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'

let pendingId = 0

const GalleryManagement = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null })
  const [previewItem, setPreviewItem] = useState(null)

  // Photos chosen but not yet uploaded — shown in a tray so the user can review
  // before sending. Each: { id, file }.
  const [pending, setPending] = useState([])
  const [labels, setLabels] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [dragging, setDragging] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    loadGallery()
  }, [selectedTag])

  const loadGallery = async () => {
    try {
      setLoading(true)
      const response = await galleryApi.getAll(selectedTag)
      const data = response.data || response
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      showToast.error('Error', 'Failed to load gallery items')
    } finally {
      setLoading(false)
    }
  }

  // ── Choosing photos (drop zone + file picker) ──
  const addFiles = (fileList) => {
    const imgs = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setPending(prev => [...prev, ...imgs.map(file => ({ id: ++pendingId, file }))])
  }

  const removePending = (id) => setPending(prev => prev.filter(p => p.id !== id))

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  // ── Uploading the tray ──
  // Backend takes one image per request, so we send them one by one and show
  // progress. Title defaults to the filename; labels (tags) apply to all.
  const handleUploadAll = async () => {
    if (!pending.length) return
    const tags = labels.split(',').map(t => t.trim()).filter(Boolean)

    setUploading(true)
    setProgress({ done: 0, total: pending.length })
    let ok = 0
    let failed = 0

    for (const p of pending) {
      try {
        await galleryApi.upload({
          image: p.file,
          title: p.file.name.replace(/\.[^./\\]+$/, ''), // filename without extension
          tags
        })
        ok++
      } catch (error) {
        failed++
      }
      setProgress(prev => ({ ...prev, done: prev.done + 1 }))
    }

    setUploading(false)
    setPending([])
    setLabels('')
    setProgress({ done: 0, total: 0 })

    if (ok) showToast.success('Done', `${ok} photo${ok > 1 ? 's' : ''} added to the gallery`)
    if (failed) showToast.error('Some failed', `${failed} photo${failed > 1 ? 's' : ''} couldn't be uploaded`)
    loadGallery()
  }

  const handleDelete = async (item) => {
    try {
      const id = item._id || item.id
      await galleryApi.delete(id)
      showToast.success('Removed', 'Photo deleted from the gallery')
      setItems(items.filter(i => (i._id || i.id) !== id))
    } catch (error) {
      showToast.error('Error', 'Delete failed')
    }
  }

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Derived tags for the filter buttons
  const allTags = Array.from(new Set(items.flatMap(item => item.tags || []))).sort()

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Photo Gallery</h1>
        <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Add and manage the photos shown across the website.</p>
      </div>

      {/* ── Add photos: always-visible drop zone + staging tray ── */}
      <div className="mb-8">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all py-10 px-6 text-center
            ${dragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/15 bg-white/[0.03] hover:border-purple-500/60 hover:bg-purple-500/5 data-[theme=light]:border-gray-300 data-[theme=light]:bg-black/[0.02]'}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400">
            <ImagePlus size={28} />
          </div>
          <div>
            <p className="text-gray-200 font-semibold m-0 text-[1.05rem] data-[theme=light]:text-gray-800">
              Drag photos here, or click to choose
            </p>
            <p className="text-gray-500 text-[0.85rem] mt-1 m-0">You can add several at once — PNG, JPG or WEBP</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
          />
        </div>

        {/* Staging tray — review before uploading */}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden data-[theme=light]:bg-white data-[theme=light]:border-gray-200"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-gray-200 font-semibold data-[theme=light]:text-gray-800">
                  {pending.length} photo{pending.length > 1 ? 's' : ''} ready to add
                </span>
                {!uploading && (
                  <button
                    onClick={() => setPending([])}
                    className="text-[0.85rem] text-gray-500 hover:text-red-400 transition-all flex items-center gap-1"
                  >
                    <X size={14} /> Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 mb-5">
                {pending.map(p => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <img src={URL.createObjectURL(p.file)} alt={p.file.name} className="w-full h-full object-cover" />
                    {!uploading && (
                      <button
                        onClick={() => removePending(p.id)}
                        className="absolute top-1 right-1 bg-black/70 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
                  <label className="text-[0.85rem] text-gray-400 font-medium data-[theme=light]:text-gray-600">
                    Labels <span className="text-gray-600 font-normal">(optional — helps you find these later)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. homepage, food, events"
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    disabled={uploading}
                    className="w-full py-2.5 px-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all disabled:opacity-50 data-[theme=light]:bg-gray-50 data-[theme=light]:text-black data-[theme=light]:border-gray-200"
                  />
                </div>
                <button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="py-2.5 px-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(168,85,247,0.3)] disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 min-w-[170px]"
                >
                  {uploading
                    ? <><Loader className="animate-spin" size={18} /> Uploading {progress.done}/{progress.total}</>
                    : <><Upload size={18} /> Add {pending.length} to gallery</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Existing photos ── */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <h2 className="text-[1.15rem] font-semibold text-gray-200 m-0 data-[theme=light]:text-gray-800">
          In the gallery {items.length > 0 && <span className="text-gray-500 font-normal">({items.length})</span>}
        </h2>
        {items.length > 0 && (
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 px-11 bg-white/5 border border-white/10 rounded-xl text-gray-100 outline-none focus:border-purple-500 transition-all data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-gray-200"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 overflow-x-auto scrollbar-none max-w-full data-[theme=light]:bg-white data-[theme=light]:border-gray-200">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${selectedTag === '' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader className="animate-spin text-purple-500 mb-4" size={48} />
          <p className="text-gray-500">Loading photos...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] bg-white/5 rounded-2xl border border-dashed border-white/10 data-[theme=light]:bg-black/[0.02]">
          <ImageIcon size={56} className="text-gray-700 mb-3" />
          <h3 className="text-gray-300 font-semibold mb-1">No photos yet</h3>
          <p className="text-gray-500 text-[0.9rem]">Use the box above to add your first photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id || item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all data-[theme=light]:bg-white data-[theme=light]:border-gray-200"
            >
              <div className="relative aspect-square overflow-hidden bg-black/20">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => setPreviewItem(item)} title="View" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white backdrop-blur-md">
                    <Eye size={20} />
                  </button>
                  <button onClick={() => setDeleteModal({ isOpen: true, item })} title="Delete" className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-all text-red-400 backdrop-blur-md">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              {(item.title || item.tags?.length > 0) && (
                <div className="p-3">
                  {item.title && <h3 className="text-[0.9rem] font-semibold text-gray-100 m-0 data-[theme=light]:text-gray-900 truncate">{item.title}</h3>}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[0.65rem] font-medium">
                          <TagIcon size={9} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteModal.item)}
        title="Delete photo"
        message={`Remove "${deleteModal.item?.title || 'this photo'}" from the gallery? Any section of the website using it will lose the image.`}
        confirmText="Remove"
        type="danger"
      />

      {/* Full Preview */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewItem(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-full max-h-full">
              <button onClick={() => setPreviewItem(null)} className="absolute -top-12 right-0 p-2 text-white hover:text-purple-400 transition-all flex items-center gap-2 font-bold cursor-pointer bg-transparent border-none">
                <X size={28} /> Close
              </button>
              <img src={previewItem.url} alt={previewItem.title} className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" />
              <div className="mt-4 text-center">
                <h2 className="text-white m-0 text-xl">{previewItem.title}</h2>
                {previewItem.description && <p className="text-gray-400 mt-2">{previewItem.description}</p>}
                {previewItem.tags?.length > 0 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {previewItem.tags.map(t => <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">#{t}</span>)}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryManagement
