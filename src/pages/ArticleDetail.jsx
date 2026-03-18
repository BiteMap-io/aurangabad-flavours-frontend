import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, BookOpen, Tag } from 'lucide-react'
import { articlesApi } from '../services/adminApi'
import './ArticleDetail.css'

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const authorName = (a) => {
  if (!a) return 'IHM Staff'
  if (typeof a === 'object') return a.name || 'IHM Staff'
  return a
}

// Render markdown-ish plain text into proper HTML paragraphs
const renderContent = (content) => {
  if (!content) return ''
  // If already has HTML tags, use as-is
  if (/<\w/.test(content)) return content
  // Otherwise treat as plain text / markdown-like
  return content
    .split(/\n{2,}/)
    .map(para => {
      const trimmed = para.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('# ')) return `<h2>${trimmed.slice(2)}</h2>`
      if (trimmed.startsWith('## ')) return `<h3>${trimmed.slice(3)}</h3>`
      if (trimmed.startsWith('### ')) return `<h4>${trimmed.slice(4)}</h4>`
      if (trimmed.startsWith('> ')) return `<blockquote>${trimmed.slice(2)}</blockquote>`
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`
    })
    .join('')
}

const ArticleDetail = () => {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [progress, setProgress] = useState(0)
  const contentRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    window.scrollTo(0, 0)

    articlesApi.getBySlug(slug)
      .then(res => {
        // Handle both direct data and { data: ... }
        const data = res.data || res;
        if (data && (data._id || data.id)) {
          setArticle(data)
          // Fetch related articles from same category
          articlesApi.getAll().then(allRes => {
            const allData = Array.isArray(allRes) ? allRes : (allRes?.data || [])
            const cats = allData.filter(a => 
              a.category === data.category && 
              (a._id || a.id) !== (data._id || data.id) &&
              (a.status === 'published' || !a.status)
            ).slice(0, 3)
            setRelated(cats)
          })
        } else {
          setNotFound(true)
        }
      })
      .catch(err => {
        console.error('Failed to fetch article details:', err)
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight
      const scrolled = Math.max(0, -rect.top)
      setProgress(Math.min(100, (scrolled / total) * 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [article])

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-loading-spinner" />
        <p>Loading article...</p>
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="ad-not-found">
        <BookOpen size={48} />
        <h2>Article Not Found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/articles" className="ad-back-btn"><ArrowLeft size={16} /> Back to Articles</Link>
      </div>
    )
  }

  return (
    <div className="ad-root">
      {/* Progress bar */}
      <div className="ad-progress-bar" style={{ width: `${progress}%` }} />

      {/* ── Hero ───────────────────────────────── */}
      <header className="ad-hero">
        <div className="ad-hero-img-wrap">
          <img src={article.image} alt={article.title} className="ad-hero-img" />
          <div className="ad-hero-overlay" />
        </div>
        <div className="ad-hero-content">
          {/* Breadcrumb */}
          <nav className="ad-breadcrumb">
            <Link to="/articles"><ArrowLeft size={15} /> Articles</Link>
            <span>/</span>
            <span>{article.category}</span>
          </nav>

          <motion.div
            className="ad-hero-text"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="ad-category-badge">{article.category}</span>
            <h1 className="ad-title">{article.title}</h1>
            <p className="ad-excerpt-hero">{article.excerpt}</p>

            {/* Meta row */}
            <div className="ad-meta-row">
              <div className="ad-meta-author">
                <div className="ad-author-avatar">{authorName(article.author)?.[0] || 'I'}</div>
                <div>
                  <span className="ad-author-name">{authorName(article.author)}</span>
                  <span className="ad-author-label">Author</span>
                </div>
              </div>
              <div className="ad-meta-right">
                <span className="ad-meta-item"><Calendar size={14} />{formatDate(article.publishedDate)}</span>
                <span className="ad-meta-dot" />
                <span className="ad-meta-item"><Clock size={14} />{article.readTime}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Article Body ───────────────────────── */}
      <div className="ad-layout" ref={contentRef}>
        <motion.article
          className="ad-article-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
        />

        {/* ── Sidebar ──────────────────────────── */}
        <aside className="ad-sidebar">
          {/* Author card */}
          <div className="ad-sidebar-card">
            <h4>About the Author</h4>
            <div className="ad-sidebar-author">
              <div className="ad-sidebar-avatar">{authorName(article.author)?.[0] || 'I'}</div>
              <div>
                <p className="ad-sidebar-author-name">{authorName(article.author)}</p>
                <p className="ad-sidebar-author-role">IHM Contributor</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="ad-sidebar-card">
              <h4><Tag size={14} /> Tags</h4>
              <div className="ad-tags">
                {article.tags.map(tag => (
                  <span key={tag} className="ad-tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Table-of-contents placeholder (static for now) */}
          <div className="ad-sidebar-card ad-sidebar-info">
            <div className="ad-sidebar-info-item"><Calendar size={14} /><span>{formatDate(article.publishedDate)}</span></div>
            <div className="ad-sidebar-info-item"><Clock size={14} /><span>{article.readTime}</span></div>
            <div className="ad-sidebar-info-item"><BookOpen size={14} /><span>{article.category}</span></div>
          </div>
        </aside>
      </div>

      {/* ── Related Articles ───────────────────── */}
      {related.length > 0 && (
        <section className="ad-related">
          <div className="ad-related-inner">
            <h2>More from the Journal</h2>
            <div className="ad-related-grid">
              {related.map((r, i) => (
                <motion.article
                  key={r._id || r.id}
                  className="ad-related-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                >
                  <Link to={`/articles/${r.slug}`} className="ad-related-link">
                    <div className="ad-related-img-wrap">
                      <img src={r.image} alt={r.title} />
                    </div>
                    <div className="ad-related-content">
                      <span className="ad-tag ad-tag-sm">{r.category}</span>
                      <h3>{r.title}</h3>
                      <p>{r.excerpt}</p>
                      <div className="ad-related-meta">
                        <Clock size={12} /> {r.readTime}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="ad-back-row">
        <Link to="/articles" className="ad-back-btn"><ArrowLeft size={16} /> All Articles</Link>
      </div>
    </div>
  )
}

export default ArticleDetail