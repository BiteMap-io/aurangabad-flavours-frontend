import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { articlesApi } from '../services/adminApi'
import './Articles.css'

const Articles = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const articleCategories = [
    'News', 'Features', 'Interviews', 'Local Guides', 'Where to Eat', 
    'Best Local Restaurants', 'Best Sunday Roasts', 'Awards & Recognition', 'City Highlights'
  ]

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articlesApi.getAll()
        const data = response.data || response
        setArticles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  // Handle URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && articleCategories.includes(categoryParam)) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (category) {
      setSearchParams({ category })
    } else {
      setSearchParams({})
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === '' || article.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = articles.filter(article => article.featured)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="articles-page">
      {/* Hero Section */}
      <section className="articles-hero-section">
        <div className="articles-hero-overlay" />
        <div className="articles-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Food & Culture Articles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Stories, guides, and insights curated by IHM MGM University
          </motion.p>
        </div>
      </section>

      <div className="articles-content">
        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <section className="featured-articles-section">
            <h2 className="section-title">Featured Stories</h2>
            <div className="featured-articles-grid">
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article._id || article.id}
                  className="featured-article-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/articles/${article.slug}`} className="article-link">
                    <div className="article-image">
                      <img src={article.image} alt={article.title} />
                      <div className="article-category-badge">{article.category}</div>
                    </div>
                    <div className="article-content">
                      <h3 className="article-title">{article.title}</h3>
                      <p className="article-excerpt">{article.excerpt}</p>
                      <div className="article-meta">
                        <span className="article-author">
                          <User size={14} />
                          {typeof article.author === 'object' ? article.author.name : article.author}
                        </span>
                        <span className="article-date">
                          <Calendar size={14} />
                          {formatDate(article.publishDate)}
                        </span>
                        <span className="article-read-time">
                          <Clock size={14} />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {/* Filters Section */}
        <section className="articles-filters">
          <div className="filters-header">
            <h2>All Articles</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('')}
            >
              All Categories
            </button>
            {articleCategories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="articles-grid-section">
          {loading ? (
            <div className="loading-spinner">Fetching stories...</div>
          ) : (
            <div className="articles-grid">
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article._id || article.id}
                  className="article-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Link to={`/articles/${article.slug}`} className="article-link">
                    <div className="article-image">
                      <img src={article.image} alt={article.title} />
                      <div className="article-category-badge">{article.category}</div>
                    </div>
                    <div className="article-content">
                      <h3 className="article-title">{article.title}</h3>
                      <p className="article-excerpt">{article.excerpt}</p>
                      <div className="article-meta">
                        <span className="article-author">
                          <User size={14} />
                          {typeof article.author === 'object' ? article.author.name : article.author}
                        </span>
                        <span className="article-date">
                          <Calendar size={14} />
                          {formatDate(article.publishDate)}
                        </span>
                        <span className="article-read-time">
                          <Clock size={14} />
                          {article.readTime}
                        </span>
                      </div>
                      <div className="read-more">
                        <span>Read Article</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {filteredArticles.length === 0 && (
            <div className="no-articles">
              <p>No articles found matching your criteria.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Articles