import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, BookOpen, Tag } from 'lucide-react'
import { articlesApi } from '../services/adminApi'

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
  if (/<\w/.test(content)) return content
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
        const data = res.data || res;
        if (data && (data._id || data.id)) {
          setArticle(data)
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
      <div className="flex flex-col items-center justify-center h-[80vh] gap-[1rem] color-[#6b7280] bg-[#080808] text-[#e5e7eb] font-['Inter',sans-serif]">
        <div className="w-[44px] h-[44px] border-[3px] border-[rgba(168,85,247,0.2)] border-t-[#a855f7] rounded-full animate-[spin_0.9s_linear_infinite]" />
        <p>Loading article...</p>
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-[1rem] color-[#4b5563] bg-[#080808] text-[#e5e7eb] font-['Inter',sans-serif]">
        <BookOpen size={48} className="text-[#4b5563]"/>
        <h2 className="text-[#e5e7eb] text-[1.5rem] m-0">Article Not Found</h2>
        <p className="text-[#6b7280] m-0">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/articles" className="inline-flex items-center gap-[0.5rem] text-[#9ca3af] text-[0.875rem] font-medium no-underline py-[0.5rem] px-[1rem] border border-white/5 rounded-[0.6rem] transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e5e7eb]"><ArrowLeft size={16} /> Back to Articles</Link>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          .ad-article-body h2 { font-size: 1.65rem; font-weight: 700; color: var(--text-primary); margin: 2.5rem 0 1rem; letter-spacing: -0.02em; line-height: 1.3; }
          .ad-article-body h3 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 2rem 0 0.75rem; line-height: 1.35; }
          .ad-article-body h4 { font-size: 1.1rem; font-weight: 600; color: var(--text-secondary); margin: 1.5rem 0 0.625rem; }
          .ad-article-body p { margin: 0 0 1.5rem; color: var(--text-secondary); }
          .ad-article-body blockquote { margin: 2rem 0; padding: 1.25rem 1.5rem; border-left: 4px solid var(--accent-purple); background: var(--bg-glass-surface); border-radius: 0 0.75rem 0.75rem 0; font-style: italic; color: var(--accent-purple); font-size: 1.05rem; }
          .ad-article-body a { color: var(--accent-purple); text-decoration: underline; text-underline-offset: 3px; }
          .ad-article-body img { width: 100%; border-radius: 0.75rem; margin: 1.5rem 0; border: 1px solid var(--border-glass-border); }
          .ad-article-body ul, .ad-article-body ol { padding-left: 2rem; margin: 0 0 1.5rem; color: var(--text-secondary); }
          .ad-article-body li { margin-bottom: 0.5rem; }
          .ad-article-body code { background: var(--bg-glass-surface); padding: 0.2em 0.4em; border-radius: 0.25rem; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-glass-border); }
          .ad-article-body hr { border: none; border-top: 1px solid var(--border-glass-border); margin: 2.5rem 0; }
        `}
      </style>
      <div className="min-h-screen bg-background-primary font-sans text-primary">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-accent-purple to-[#7c3aed] z-[999] transition-[width] duration-100 ease-linear rounded-r-sm" style={{ width: `${progress}%` }} />

        {/* ── Hero ───────────────────────────────── */}
        <header className="relative h-[min(80vh,560px)] max-md:h-[min(60vh,420px)] overflow-hidden flex items-end border-b border-glass-border">
          <div className="absolute inset-0">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover light:brightness-[0.9]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1] light:from-black/60 light:via-black/20" />
          </div>
          <div className="relative z-[2] w-full max-w-[860px] mx-auto pt-0 px-[2rem] pb-[3rem] max-md:px-[1.25rem] max-md:pb-[2.5rem]">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-[0.5rem] text-[0.82rem] text-white/70 mb-[1.25rem]">
              <Link to="/articles" className="flex items-center gap-[0.35rem] text-white/70 no-underline transition-colors hover:text-white"><ArrowLeft size={15} /> Articles</Link>
              <span>/</span>
              <span>{article.category}</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-block py-[0.25rem] px-[0.75rem] bg-accent-purple/20 border border-accent-purple/40 rounded-full text-[0.72rem] font-semibold text-white tracking-[0.06em] uppercase mb-[0.875rem] shadow-sm backdrop-blur-md">{article.category}</span>
              <h1 className="font-serif text-[clamp(1.6rem,4vw,2.75rem)] font-bold text-white leading-[1.3] m-0 mb-[0.875rem] tracking-[-0.02em] drop-shadow-lg">{article.title}</h1>
              <p className="text-[1.05rem] text-white/90 leading-[1.65] m-0 mb-[1.25rem] max-w-[680px] drop-shadow-md">{article.excerpt}</p>

              {/* Meta row */}
              <div className="flex items-start md:items-center justify-between flex-wrap gap-[1rem] max-md:flex-col">
                <div className="flex items-center gap-[0.75rem]">
                  <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-accent-purple to-[#7c3aed] flex items-center justify-center text-[0.875rem] font-bold text-white border-[2px] border-white/20 shadow-lg shrink-0">{authorName(article.author)?.[0] || 'I'}</div>
                  <div>
                    <span className="block text-[0.9rem] font-semibold text-white">{authorName(article.author)}</span>
                    <span className="block text-[0.75rem] text-white/70">Author</span>
                  </div>
                </div>
                <div className="flex items-center gap-[0.75rem] text-[0.82rem] text-white/80">
                  <span className="flex items-center gap-[0.35rem]"><Calendar size={14} />{formatDate(article.publishedDate)}</span>
                  <span className="w-[3px] h-[3px] rounded-full bg-white/40" />
                  <span className="flex items-center gap-[0.35rem]"><Clock size={14} />{article.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ── Article Body ───────────────────────── */}
        <div className="max-w-[1200px] mx-auto py-[4rem] px-[2rem] max-md:py-[2.5rem] max-md:px-[1.25rem] grid grid-cols-[1fr_280px] max-lg:grid-cols-1 gap-[4rem] max-lg:gap-[2.5rem] items-start" ref={contentRef}>
          <motion.article
            className="ad-article-body font-serif text-[1.1rem] leading-[1.85] text-secondary min-w-0 max-md:text-[1rem] max-md:leading-[1.75]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
          />

          {/* ── Sidebar ──────────────────────────── */}
          <aside className="sticky top-[5rem] flex flex-col gap-[1.25rem] max-lg:static">
            {/* Author card */}
            <div className="bg-glass-surface border border-glass-border rounded-[1rem] p-[1.25rem] shadow-glass">
              <h4 className="text-[0.8rem] font-semibold text-tertiary uppercase tracking-[0.08em] m-0 mb-[0.875rem] flex items-center gap-[0.4rem]">About the Author</h4>
              <div className="flex items-center gap-[0.75rem]">
                <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-accent-purple to-[#7c3aed] flex items-center justify-center text-[1rem] font-bold text-white shrink-0 border border-white/10">{authorName(article.author)?.[0] || 'I'}</div>
                <div>
                  <p className="text-[0.9rem] font-semibold text-primary m-0">{authorName(article.author)}</p>
                  <p className="text-[0.78rem] text-tertiary m-0 mt-[0.15rem]">IHM Contributor</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="bg-glass-surface border border-glass-border rounded-[1rem] p-[1.25rem] shadow-glass">
                <h4 className="text-[0.8rem] font-semibold text-tertiary uppercase tracking-[0.08em] m-0 mb-[0.875rem] flex items-center gap-[0.4rem]"><Tag size={14} /> Tags</h4>
                <div className="flex flex-wrap gap-[0.5rem]">
                  {article.tags.map(tag => (
                    <span key={tag} className="py-[0.25rem] px-[0.65rem] bg-glass-surface border border-glass-border rounded-full text-[0.75rem] text-secondary">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Article Meta */}
            <div className="bg-glass-surface border border-glass-border rounded-[1rem] p-[1.25rem] shadow-glass flex flex-col gap-[0.625rem]">
              <div className="flex items-center gap-[0.6rem] text-[0.85rem] text-secondary"><Calendar size={14} /><span>{formatDate(article.publishedDate)}</span></div>
              <div className="flex items-center gap-[0.6rem] text-[0.85rem] text-secondary"><Clock size={14} /><span>{article.readTime}</span></div>
              <div className="flex items-center gap-[0.6rem] text-[0.85rem] text-secondary"><BookOpen size={14} /><span>{article.category}</span></div>
            </div>
          </aside>
        </div>

        {/* ── Related Articles ───────────────────── */}
        {related.length > 0 && (
          <section className="bg-background-secondary border-t border-glass-border py-[4rem] px-0 max-md:py-[2.5rem]">
            <div className="max-w-[1200px] mx-auto px-[2rem]">
              <h2 className="font-serif text-[1.75rem] text-primary m-0 mb-[2rem] tracking-[-0.01em]">More from the Journal</h2>
              <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[1.5rem]">
                {related.map((r, i) => (
                  <motion.article
                    key={r._id || r.id}
                    className="bg-background-primary border border-glass-border rounded-[1rem] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-glass group"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                  >
                    <Link to={`/articles/${r.slug}`} className="block no-underline text-inherit h-full">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.05]" />
                      </div>
                      <div className="p-[1.1rem] flex flex-col gap-[0.4rem]">
                        <span className="inline-block self-start py-[0.2rem] px-[0.6rem] bg-accent-purple/10 border border-accent-purple/20 rounded-full text-[0.65rem] font-semibold text-accent-purple uppercase tracking-[0.05em]">{r.category}</span>
                        <h3 className="font-serif text-[0.95rem] font-bold text-primary m-0 leading-[1.4] line-clamp-2">{r.title}</h3>
                        <p className="text-[0.82rem] text-secondary leading-[1.55] m-0 line-clamp-2">{r.excerpt}</p>
                        <div className="flex items-center gap-[0.35rem] text-[0.76rem] text-tertiary mt-[0.25rem]">
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
        <div className="py-[2.5rem] px-[2rem] max-w-[1200px] mx-auto">
          <Link to="/articles" className="inline-flex items-center gap-[0.5rem] text-secondary text-[0.875rem] font-medium no-underline py-[0.5rem] px-[1rem] border border-glass-border rounded-[0.6rem] transition-all duration-200 hover:bg-glass-surface hover:text-primary"><ArrowLeft size={16} /> All Articles</Link>
        </div>
      </div>
    </>
  )
}

export default ArticleDetail