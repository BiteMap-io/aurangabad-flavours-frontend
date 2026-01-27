import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Calendar,
  Loader,
  Tag
} from 'lucide-react'
import { articlesApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'
import ConfirmModal from '../../components/admin/ConfirmModal'
import './ArticlesManagement.css'

const ArticlesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, article: null })

  // Load articles data
  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const response = await articlesApi.getAll()
      if (response.success) {
        setArticles(response.data)
      } else {
        showToast.error('Error', 'Failed to load articles')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory
      const matchesStatus = filterStatus === 'all' || article.status === filterStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'date':
          return new Date(b.publishedAt) - new Date(a.publishedAt)
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  const handleDelete = async (article) => {
    try {
      const response = await articlesApi.delete(article.id)
      if (response.success) {
        setArticles(articles.filter(a => a.id !== article.id))
        showToast.success('Success', `${article.title} has been deleted`)
      } else {
        showToast.error('Error', response.error || 'Failed to delete article')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to delete article')
    }
  }

  const toggleStatus = async (id) => {
    try {
      const article = articles.find(a => a.id === id)
      const newStatus = article.status === 'published' ? 'draft' : 'published'
      const updatedArticle = { ...article, status: newStatus }
      
      const response = await articlesApi.update(id, updatedArticle)
      if (response.success) {
        setArticles(articles.map(a => a.id === id ? response.data : a))
        showToast.success('Success', `Article ${newStatus}`)
      } else {
        showToast.error('Error', response.error || 'Failed to update article status')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to update article status')
    }
  }

  const openDeleteModal = (article) => {
    setDeleteModal({ isOpen: true, article })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, article: null })
  }

  const confirmDelete = () => {
    if (deleteModal.article) {
      handleDelete(deleteModal.article)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'news':
        return 'blue'
      case 'features':
        return 'purple'
      case 'interviews':
        return 'green'
      case 'guides':
        return 'orange'
      case 'awards':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusColor = (status) => {
    return status === 'published' ? 'green' : 'orange'
  }

  return (
    <div className="articles-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Articles Management</h1>
          <p>Manage your articles and blog posts</p>
        </div>
        <Link to="/admin/articles/add" className="btn-primary">
          <Plus size={20} />
          Add New Article
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="news">News</option>
            <option value="features">Features</option>
            <option value="interviews">Interviews</option>
            <option value="guides">Guides</option>
            <option value="awards">Awards</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>Loading articles...</p>
        </div>
      ) : (
        <div className="articles-grid">
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              className="article-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="article-image">
                <img src={article.image} alt={article.title} />
                <div className="article-badges">
                  <span className={`badge category ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className={`badge status ${getStatusColor(article.status)}`}>
                    {article.status}
                  </span>
                </div>
              </div>

              <div className="article-content">
                <div className="article-header">
                  <h3>{article.title}</h3>
                  <div className="article-meta">
                    <div className="article-date">
                      <Calendar size={14} />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="article-author">
                      By {article.author}
                    </div>
                  </div>
                </div>

                <div className="article-details">
                  <p className="excerpt">{article.excerpt}</p>
                  <div className="article-stats">
                    <span className="read-time">{article.readTime} min read</span>
                    <div className="article-tags">
                      <Tag size={12} />
                      <span>{article.tags?.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="article-actions">
                  <Link 
                    to={`/admin/articles/edit/${article.id}`}
                    className="action-btn edit"
                    title="Edit Article"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    className="action-btn view"
                    title="View Article"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className={`action-btn status ${article.status === 'published' ? 'published' : 'draft'}`}
                    onClick={() => toggleStatus(article.id)}
                    title={`${article.status === 'published' ? 'Unpublish' : 'Publish'} Article`}
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => openDeleteModal(article)}
                    title="Delete Article"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredArticles.length === 0 && (
        <div className="empty-state">
          <div className="empty-content">
            <FileText size={48} />
            <h3>No articles found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="pagination">
          <p>Showing {filteredArticles.length} of {articles.length} articles</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteModal.article?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default ArticlesManagement