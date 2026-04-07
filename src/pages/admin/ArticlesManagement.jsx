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
      setLoading(true);
      const response = await articlesApi.getAll();
      const data = response.data || response;
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        showToast.error('Error', 'Failed to load articles');
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
          return new Date(b.publishedDate) - new Date(a.publishedDate)
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  const handleDelete = async (article) => {
    try {
      const articleId = article._id || article.id
      const response = await articlesApi.delete(articleId)
      if (response.success || response) {
        setArticles(articles.filter(a => (a._id || a.id) !== articleId))
        showToast.success('Success', `${article.title} has been deleted`)
      } else {
        showToast.error('Error', 'Failed to delete article')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to delete article')
    }
  }

  const toggleStatus = async (id) => {
    try {
      const response = await articlesApi.toggleStatus(id)
      const updatedArticle = response.data || response
      if (updatedArticle && updatedArticle._id) {
        setArticles(articles.map(a => (a._id || a.id) === id ? updatedArticle : a))
        showToast.success('Success', `Article ${updatedArticle.status}`)
      } else {
        showToast.error('Error', 'Failed to update article status')
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
      case 'news': return 'bg-gradient-to-br from-blue-500 to-blue-700'
      case 'features': return 'bg-gradient-to-br from-purple-500 to-purple-700'
      case 'interviews': return 'bg-gradient-to-br from-emerald-500 to-emerald-700'
      case 'guides': return 'bg-gradient-to-br from-amber-500 to-amber-700'
      case 'awards': return 'bg-gradient-to-br from-red-500 to-red-600'
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status) => {
    return status === 'published' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-amber-500 to-amber-700'
  }

  const getAuthorName = (author) => {
    if (!author) return 'IHM Staff'
    if (typeof author === 'object') return author.name || 'IHM Staff'
    return author
  }

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 max-[480px]:text-[1.5rem] data-[theme=light]:text-gray-900">Articles Management</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Manage your articles and blog posts</p>
        </div>
        <Link to="/admin/articles/add" className="inline-flex items-center gap-1.5 py-2 px-6 bg-gradient-to-br from-purple-500 to-[#9b59b6] border-none rounded-lg text-white no-underline font-semibold transition-all duration-300 hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(138,43,226,0.2)] hover:shadow-[0_8px_25px_rgba(138,43,226,0.3)]">
          <Plus size={20} />
          Add New Article
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-8 flex-wrap max-md:flex-col">
        <div className="relative flex-1 min-w-[300px] max-md:min-w-0">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          />
        </div>

        <div className="flex gap-2 max-md:flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
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
            className="py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.9rem] outline-none cursor-pointer transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500 data-[theme=light]:text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0 text-[1rem]">Loading articles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6 mb-8 max-md:grid-cols-1">
          {filteredArticles.map((article, index) => {
            const articleId = article._id || article.id
            return (
              <motion.div
                key={articleId}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative h-[200px] overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`py-1 px-2 rounded font-semibold text-[0.75rem] text-white capitalize ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className={`py-1 px-2 rounded font-semibold text-[0.75rem] text-white capitalize ${getStatusColor(article.status)}`}>
                    {article.status}
                  </span>
                </div>
              </div>

              <div className="p-6 max-[480px]:p-4">
                <div className="mb-4">
                  <h3 className="text-[1.1rem] font-semibold text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 leading-[1.3] line-clamp-2">{article.title}</h3>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8rem] text-gray-500 max-md:flex-col max-md:items-start max-md:gap-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{formatDate(article.publishedDate)}</span>
                    </div>
                    <div className="italic">
                      By {getAuthorName(article.author)}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-500 text-[0.9rem] m-0 mb-2 leading-[1.4] line-clamp-3">{article.excerpt}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8rem] text-gray-500 max-md:flex-col max-md:items-start max-md:gap-1">
                    <span className="font-medium">{article.readTime}</span>
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} />
                      <span>{article.tags?.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 justify-end max-md:justify-center">
                  <Link 
                    to={`/admin/articles/edit/${articleId}`}
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-white/5 text-gray-500 cursor-pointer transition-all duration-200 no-underline hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:border-black/10 data-[theme=light]:bg-white/80"
                    title="Edit Article"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent text-gray-500 cursor-pointer transition-all duration-200 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 data-[theme=light]:border-black/10"
                    title="View Article"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className={`w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent cursor-pointer transition-all duration-200 data-[theme=light]:border-black/10 ${article.status === 'published' ? 'hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-gray-500' : 'text-amber-500 border-amber-500/30 bg-amber-500/10 hover:text-amber-400 hover:bg-amber-500/20'}`}
                    onClick={() => toggleStatus(articleId)}
                    title={`${article.status === 'published' ? 'Unpublish' : 'Publish'} Article`}
                  >
                    <FileText size={16} className={article.status === 'published' ? '' : 'text-amber-500'} />
                  </button>
                  <button
                    className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent text-gray-500 cursor-pointer transition-all duration-200 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 data-[theme=light]:border-black/10"
                    onClick={() => openDeleteModal(article)}
                    title="Delete Article"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      )}

      {!loading && filteredArticles.length === 0 && (
        <div className="flex items-center justify-center min-h-[300px] text-center text-gray-500">
          <div>
            <FileText size={48} className="mx-auto mb-4" />
            <h3 className="text-gray-100 data-[theme=light]:text-gray-900 m-0 mb-2 font-semibold">No articles found</h3>
            <p className="m-0">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-center py-6 border-t border-white/10 data-[theme=light]:border-black/10 mt-4">
          <p className="text-gray-500 text-[0.9rem] m-0">Showing {filteredArticles.length} of {articles.length} articles</p>
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