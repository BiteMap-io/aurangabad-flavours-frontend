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
import './MediaManager.css'

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
      if (response.success) {
        setMedia(response.data)
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
        if (response.success) {
          return response.data
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
      const response = await mediaApi.delete(mediaItem.id)
      if (response.success) {
        setMedia(media.filter(m => m.id !== mediaItem.id))
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
    <div className="media-manager">
      <div className="page-header">
        <div className="header-content">
          <h1>Media Manager</h1>
          <p>Upload and manage your media files</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader size={20} className="spinner" /> : <Upload size={20} />}
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>

      {/* Upload Area */}
      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <Upload size={48} />
          <h3>Drop files here or click to upload</h3>
          <p>Support for images, videos, and documents</p>
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
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>Loading media...</p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredMedia.map((mediaItem, index) => (
            <motion.div
              key={mediaItem.id}
              className="media-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="media-preview" onClick={() => openPreviewModal(mediaItem)}>
                {mediaItem.type === 'image' ? (
                  <img src={mediaItem.url} alt={mediaItem.name} />
                ) : (
                  <div className="media-placeholder">
                    {getFileIcon(mediaItem.type)}
                  </div>
                )}
                <div className="media-overlay">
                  <Eye size={20} />
                </div>
              </div>

              <div className="media-info">
                <h4 title={mediaItem.name}>{mediaItem.name}</h4>
                <div className="media-meta">
                  <span className="media-size">{mediaItem.size}</span>
                  <span className="media-date">{formatDate(mediaItem.uploadedAt)}</span>
                </div>
              </div>

              <div className="media-actions">
                <button
                  className="action-btn view"
                  onClick={() => openPreviewModal(mediaItem)}
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <a
                  href={mediaItem.url}
                  download={mediaItem.name}
                  className="action-btn download"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <button
                  className="action-btn delete"
                  onClick={() => openDeleteModal(mediaItem)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredMedia.length === 0 && (
        <div className="empty-state">
          <div className="empty-content">
            <ImageIcon size={48} />
            <h3>No media files found</h3>
            <p>Upload some files or try adjusting your search criteria</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="pagination">
          <p>Showing {filteredMedia.length} of {media.length} files</p>
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
        <div className="preview-modal-overlay" onClick={closePreviewModal}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={closePreviewModal}>
              <X size={24} />
            </button>
            
            <div className="preview-content">
              {previewModal.media?.type === 'image' ? (
                <img src={previewModal.media.url} alt={previewModal.media.name} />
              ) : previewModal.media?.type === 'video' ? (
                <video controls>
                  <source src={previewModal.media.url} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="file-preview">
                  {getFileIcon(previewModal.media?.type)}
                  <h3>{previewModal.media?.name}</h3>
                  <p>File preview not available</p>
                </div>
              )}
            </div>
            
            <div className="preview-info">
              <h3>{previewModal.media?.name}</h3>
              <div className="preview-meta">
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