import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight, Search, BookOpen,  Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { articlesApi } from '../services/adminApi'
import './Articles.css'

const CATEGORIES = ['All', 'News', 'Features', 'Interviews', 'Guides', 'Awards']

const formatDate = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch (e) {
    return d
  }
}

const authorName = (a) => {
  if (!a) return 'IHM Staff'
  if (typeof a === 'object') return a.name || 'IHM Staff'
  return a
}

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="art-skeleton-card">
    <div className="art-skel art-skel-img" />
    <div className="art-skel-body">
      <div className="art-skel art-skel-tag" />
      <div className="art-skel art-skel-h" />
      <div className="art-skel art-skel-p" />
      <div className="art-skel art-skel-p2" />
      <div className="art-skel art-skel-meta" />
    </div>
  </div>
)

const Articles = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    articlesApi.getAll()
      .then(res => {
        // Handle both direct array and { data: [...] } from axios interceptor
        const data = Array.isArray(res) ? res : (res?.data || res?.articles || [])
        if (!Array.isArray(data)) {
           console.error('API did not return an array:', res)
           setArticles([])
           return
        }
        // only show published articles on frontend
        setArticles(data.filter(a => a.status === 'published' || !a.status))
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err)
        setError('Unable to load articles. Please check your connection.')
        setArticles([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Create dynamic category list from actual articles
  const dynamicCategories = useMemo(() => {
    const cats = new Set(['All'])
    articles.forEach(a => {
      if (a.category) cats.add(a.category.charAt(0).toUpperCase() + a.category.slice(1).toLowerCase())
    })
    return Array.from(cats)
  }, [articles])

  const filtered = articles.filter(a => {
    const articleCat = (a.category || '').toLowerCase()
    const matchCat = category === 'All' || articleCat === category.toLowerCase()
    const matchQ = !query || 
                  a.title?.toLowerCase().includes(query.toLowerCase()) || 
                  a.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
                  a.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
    
    return matchCat && matchQ
  })

  const hero = filtered.find(a => a.featured) || filtered[0]
  const rest = hero ? filtered.filter(a => (a._id || a.id) !== (hero._id || hero.id)) : filtered

  return (
    <div className="art-root">
      {/* ── Page Header ─────────────────────────── */}
      <header className="art-page-header">
        <motion.div className="art-header-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="art-header-eyebrow">
            <BookOpen size={16} />
            <span>IHM Aurangabad Journal</span>
          </div>
          <h1>Stories &amp; Insights</h1>
          <p>Curated articles on food culture, dining, events and hospitality from the heart of Aurangabad.</p>
        </motion.div>
      </header>

      {/* ── Hero / Featured Post ─────────────────── */}
      <AnimatePresence mode="wait">
        {!loading && hero && (
          <motion.section
            className="art-hero-section"
            key={hero._id || hero.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to={`/articles/${hero.slug}`} className="art-hero-link">
              <div className="art-hero-card">
                <div className="art-hero-img-wrap">
                  <img src={hero.image} alt={hero.title} className="art-hero-img" />
                  <div className="art-hero-overlay" />
                  {hero.featured && (
                    <div className="art-hero-featured-badge">
                      <Star size={12} /> Featured
                    </div>
                  )}
                </div>
                <div className="art-hero-content">
                  <span className="art-tag">{hero.category}</span>
                  <h2 className="art-hero-title">{hero.title}</h2>
                  <p className="art-hero-excerpt">{hero.excerpt}</p>
                  <div className="art-hero-meta">
                    <span className="art-meta-author">
                      <div className="art-author-avatar">{authorName(hero.author)?.[0] || 'I'}</div>
                      {authorName(hero.author)}
                    </span>
                    <span className="art-meta-dot" />
                    <span>{formatDate(hero.publishedDate)}</span>
                    <span className="art-meta-dot" />
                    <Clock size={13} />
                    <span>{hero.readTime}</span>
                  </div>
                  <div className="art-hero-read-btn">
                    Read Article <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Controls: search + category pills ────── */}
      <div className="art-controls-wrap">
        <div className="art-controls">
          <div className="art-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="art-cat-pills">
            {dynamicCategories.map(c => (
              <button
                key={c}
                className={`art-cat-pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Article Grid ─────────────────────────── */}
      <main className="art-grid-section">
        <div className="art-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : rest.map((article, i) => (
                <motion.article
                  key={article._id || article.id}
                  className="art-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <Link to={`/articles/${article.slug}`} className="art-card-link">
                    <div className="art-card-img-wrap">
                      <img src={article.image} alt={article.title} className="art-card-img" />
                      <span className="art-tag art-card-tag">{article.category}</span>
                    </div>
                    <div className="art-card-body">
                      <h3 className="art-card-title">{article.title}</h3>
                      <p className="art-card-excerpt">{article.excerpt}</p>
                      <div className="art-card-meta">
                        <span className="art-meta-author">
                          <div className="art-author-avatar sm">{authorName(article.author)?.[0] || 'I'}</div>
                          {authorName(article.author)}
                        </span>
                        <span className="art-meta-right">
                          <Clock size={12} />
                          {article.readTime}
                        </span>
                      </div>
                      <div className="art-card-date">{formatDate(article.publishedDate)}</div>
                    </div>
                  </Link>
                </motion.article>
              ))
          }
        </div>

        {!loading && filtered.length === 0 && (
          <div className="art-empty">
            <BookOpen size={40} />
            <p>No articles found.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Articles