import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Search, 
  Trash2, 
  Eye, 
  Loader, 
  X,
  Plus,
  Tag as TagIcon,
  Image as ImageIcon,
  Filter
} from 'lucide-react'
import { galleryApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'

const GalleryManagement = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null })
  const [previewItem, setPreviewItem] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    image: null
  })
  
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

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!formData.image) {
      showToast.error('Error', 'Please select an image')
      return
    }

    try {
      setUploading(true)
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }
      
      const response = await galleryApi.upload(payload)
      if (response.status === 'success' || response.data) {
        showToast.success('Success', 'Image uploaded to gallery')
        setUploadModalOpen(false)
        setFormData({ title: '', description: '', tags: '', image: null })
        loadGallery()
      }
    } catch (error) {
      showToast.error('Error', 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item) => {
    try {
      const id = item._id || item.id
      await galleryApi.delete(id)
      showToast.success('Success', 'Gallery item deleted')
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
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Gallery Management</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Manage site assets, banners, and dynamic images</p>
        </div>
        <button 
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-br from-purple-500 to-purple-700 border-none rounded-lg text-white font-semibold cursor-pointer transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(168,85,247,0.3)]"
        >
          <Plus size={20} /> Add New Asset
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex gap-4 flex-wrap max-md:flex-col">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by title or tag..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 px-12 bg-white/5 border border-white/10 rounded-xl text-gray-100 outline-none focus:border-purple-500 transition-all data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 overflow-x-auto scrollbar-none data-[theme=light]:bg-white data-[theme=light]:border-gray-200">
            <Filter size={18} className="text-gray-500 shrink-0" />
            <button 
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTag === '' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
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
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader className="animate-spin text-purple-500 mb-4" size={48} />
          <p className="text-gray-500">Loading gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/5 rounded-2xl border border-dashed border-white/10">
          <ImageIcon size={64} className="text-gray-700 mb-4" />
          <h3 className="text-gray-300 font-semibold mb-1">No Assets Found</h3>
          <p className="text-gray-500">Start by uploading your first website image</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {filteredItems.map((item, index) => (
            <motion.div 
              key={item._id || item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all data-[theme=light]:bg-white data-[theme=light]:border-gray-200"
            >
              <div className="relative aspect-video overflow-hidden bg-black/20">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => setPreviewItem(item)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white backdrop-blur-md">
                    <Eye size={20} />
                  </button>
                  <button onClick={() => setDeleteModal({ isOpen: true, item })} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-all text-red-400 backdrop-blur-md">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[1rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900 truncate">{item.title}</h3>
                </div>
                {item.description && <p className="text-[0.85rem] text-gray-500 m-0 mb-4 line-clamp-2">{item.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {item.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[0.7rem] font-medium uppercase tracking-wider">
                      <TagIcon size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUploadModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[500px] bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl data-[theme=light]:bg-white"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold m-0 text-white data-[theme=light]:text-gray-900">Upload Asset</h2>
                <button onClick={() => setUploadModalOpen(false)} className="p-1 text-gray-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleUpload} className="p-6 flex flex-col gap-5">
                {/* Image Drop/Click Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all overflow-hidden relative"
                >
                  {formData.image ? (
                    <>
                      <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-600" size={40} />
                      <div className="text-center">
                        <p className="text-gray-300 font-semibold m-0 data-[theme=light]:text-gray-800">Click to upload image</p>
                        <p className="text-gray-500 text-xs mt-1">PNG, JPG or WEBP supported</p>
                      </div>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
                </div>

                <div className="grid gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Title</label>
                    <input 
                      type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all data-[theme=light]:bg-gray-50 data-[theme=light]:text-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Tags (comma separated)</label>
                    <input 
                      type="text" placeholder="homepage, banner, hero..." value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all data-[theme=light]:bg-gray-50 data-[theme=light]:text-black"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</label>
                    <textarea 
                      rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all resize-none data-[theme=light]:bg-gray-50 data-[theme=light]:text-black"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={uploading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader className="animate-spin" size={20} /> : 'Publish to Gallery'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteModal.item)}
        title="Delete Item"
        message={`Are you sure you want to remove "${deleteModal.item?.title}"? This will break any dynamic sections using this image.`}
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
                <p className="text-gray-400 mt-2">{previewItem.description}</p>
                <div className="flex justify-center gap-2 mt-4">
                  {previewItem.tags?.map(t => <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">#{t}</span>)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryManagement
