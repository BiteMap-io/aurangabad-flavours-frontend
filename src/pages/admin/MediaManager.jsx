import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Search, 
  Trash2, 
  Eye, 
  Download,
  Image as ImageIcon,
  Video,
  File,
  Loader,
  X
} from 'lucide-react'
import { mediaApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'

const MediaManager = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, media: null })
  const [previewModal, setPreviewModal] = useState({ isOpen: false, media: null })
  const fileInputRef = useRef(null)

  // Load media data
  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const response = await mediaApi.getAll()
      const data = response.data || response
      if (Array.isArray(data)) {
        setMedia(data)
      } else {
        showToast.error('Error', 'Failed to load media')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = media
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || item.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt)
        case 'size':
          return parseInt(b.size) - parseInt(a.size)
        default:
          return 0
      }
    })

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const response = await mediaApi.upload(file)
        const data = response.data || response
        if (data && data.url) {
          return data
        } else {
          showToast.error('Error', `Failed to upload ${file.name}`)
          return null
        }
      } catch (error) {
        showToast.error('Error', `Failed to upload ${file.name}`)
        return null
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)
    const successfulUploads = uploadedFiles.filter(file => file !== null)
    
    if (successfulUploads.length > 0) {
      setMedia(prev => [...successfulUploads, ...prev])
      showToast.success('Success', `${successfulUploads.length} file(s) uploaded successfully`)
    }
    
    setUploading(false)
  }
  const handleDelete = async (mediaItem) => {
    try {
      const itemId = mediaItem._id || mediaItem.id
      const response = await mediaApi.delete(itemId)
      if (response.success || response) {
        setMedia(media.filter(m => (m._id || m.id) !== itemId))
        showToast.success('Success', `${mediaItem.name} has been deleted`)
      } else {
        showToast.error('Error', 'Failed to delete media')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to delete media')
    }
  }

  const openDeleteModal = (mediaItem) => {
    setDeleteModal({ isOpen: true, media: mediaItem })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, media: null })
  }

  const confirmDelete = () => {
    if (deleteModal.media) {
      handleDelete(deleteModal.media)
    }
  }

  const openPreviewModal = (mediaItem) => {
    setPreviewModal({ isOpen: true, media: mediaItem })
  }

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, media: null })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} />
      case 'video':
        return <Video size={20} />
      default:
        return <File size={20} />
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 max-md:flex-col max-md:items-stretch">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 max-[480px]:text-[1.5rem] data-[theme=light]:text-gray-900">Media Manager</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Upload and manage your media files</p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-1.5 py-2 px-6 bg-gradient-to-br from-purple-500 to-[#9b59b6] border-none rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 hover:not-disabled:-translate-y-[2px] hover:not-disabled:shadow-[0_8px_25px_rgba(138,43,226,0.3)] disabled:opacity-70 disabled:cursor-not-allowed max-md:w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader size={20} className="animate-spin" /> : <Upload size={20} />}
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>

      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center mb-8 cursor-pointer transition-all duration-300 bg-white/5 hover:border-purple-500 hover:bg-white/10 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/20 data-[theme=light]:hover:bg-white max-[480px]:p-6"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-gray-500">
          <Upload size={48} className="text-purple-500 mb-4 mx-auto" />
          <h3 className="text-[1.1rem] text-gray-100 m-0 mb-2 data-[theme=light]:text-gray-900 font-semibold">Drop files here or click to upload</h3>
          <p className="text-[0.9rem] text-gray-500 m-0">Support for images, videos, and documents</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(e) => handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-8 flex-wrap max-md:flex-col max-md:gap-2">
        <div className="relative flex-1 min-w-[300px] max-md:min-w-0">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-[calc(1rem+24px+0.25rem)] bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          />
        </div>

        <div className="flex gap-2 max-md:flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0 text-[1rem]">Loading media...</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 mb-8 max-md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-md:gap-4 max-[480px]:grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
          {filteredMedia.map((mediaItem, index) => {
            const itemId = mediaItem._id || mediaItem.id
            return (
              <motion.div
                key={itemId}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] group flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="relative h-[150px] overflow-hidden cursor-pointer" onClick={() => openPreviewModal(mediaItem)}>
                {mediaItem.type === 'image' ? (
                  <img src={mediaItem.url} alt={mediaItem.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-transparent text-gray-500 data-[theme=light]:bg-black/5">
                    {getFileIcon(mediaItem.type)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 transition-opacity duration-300 text-white group-hover:opacity-100">
                  <Eye size={20} />
                </div>
              </div>

              <div className="p-4 pb-2 flex-grow min-w-0 max-[480px]:p-2">
                <h4 title={mediaItem.name} className="text-[0.9rem] font-semibold text-gray-100 m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis data-[theme=light]:text-gray-900">{mediaItem.name}</h4>
                <div className="flex justify-between text-[0.8rem] text-gray-500">
                  <span>{mediaItem.size}</span>
                  <span>{formatDate(mediaItem.uploadedAt)}</span>
                </div>
              </div>

              <div className="flex gap-1.5 px-4 pb-4 justify-center max-[480px]:px-2 max-[480px]:pb-2 mt-auto">
                <button
                  className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 cursor-pointer transition-all duration-200 hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-black/5"
                  onClick={() => openPreviewModal(mediaItem)}
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <a
                  href={mediaItem.url}
                  download={mediaItem.name}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 cursor-pointer transition-all duration-200 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-black/5"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <button
                  className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 cursor-pointer transition-all duration-200 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-black/5"
                  onClick={() => openDeleteModal(mediaItem)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )})}
        </div>
      )}

      {!loading && filteredMedia.length === 0 && (
        <div className="flex items-center justify-center min-h-[300px] text-center text-gray-500">
          <div>
            <ImageIcon size={48} className="mx-auto mb-4" />
            <h3 className="text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold">No media files found</h3>
            <p className="m-0">Upload some files or try adjusting your search criteria</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-center py-6 border-t border-white/10 data-[theme=light]:border-black/10 mt-4">
          <p className="text-gray-500 text-[0.9rem] m-0">Showing {filteredMedia.length} of {media.length} files</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Media File"
        message={`Are you sure you want to delete "${deleteModal.media?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-hidden max-md:p-4" onClick={closePreviewModal}>
          <div className="bg-white/5 data-[theme=light]:bg-white/95 border border-white/10 data-[theme=light]:border-black/10 rounded-2xl max-w-[90vw] max-h-[90vh] overflow-hidden relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-10 h-10 border-none rounded-full bg-black/50 text-white cursor-pointer flex items-center justify-center z-10 transition-background duration-300 hover:bg-black/70" onClick={closePreviewModal}>
              <X size={24} />
            </button>
            
            <div className="flex-1 flex items-center justify-center min-h-[300px] max-h-[70vh] bg-black/20 overflow-hidden">
              {previewModal.media?.type === 'image' ? (
                <img src={previewModal.media.url} alt={previewModal.media.name} className="max-w-full max-h-[70vh] w-auto h-auto object-contain" />
              ) : previewModal.media?.type === 'video' ? (
                <video controls className="max-w-full max-h-[70vh] w-auto h-auto object-contain">
                  <source src={previewModal.media.url} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center text-gray-500 p-8 flex flex-col items-center justify-center">
                  <div className="text-purple-500 mb-4 scale-[2]">
                    {getFileIcon(previewModal.media?.type)}
                  </div>
                  <h3 className="text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold">{previewModal.media?.name}</h3>
                  <p className="m-0">File preview not available</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/10 data-[theme=light]:border-black/10 bg-[#171717] data-[theme=light]:bg-white backdrop-blur-md">
              <h3 className="text-[1.1rem] text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{previewModal.media?.name}</h3>
              <div className="flex gap-6 text-[0.9rem] text-gray-500 max-md:flex-col max-md:gap-1">
                <span>Size: {previewModal.media?.size}</span>
                <span>Uploaded: {formatDate(previewModal.media?.uploadedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaManager