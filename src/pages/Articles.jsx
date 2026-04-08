import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Search, BookOpen, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { articlesApi } from '../services/adminApi'

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
  <div className="bg-[#111118] border border-white/5 rounded-[1.25rem] overflow-hidden">
    <div className="h-[180px] rounded-none bg-white/5 animate-[skel-shimmer_1.5s_ease-in-out_infinite]" />
    <div className="p-5 flex flex-col gap-2.5">
      <div className="h-[18px] w-[80px] rounded-full bg-white/5 animate-[skel-shimmer_1.5s_ease-in-out_infinite]" />
      <div className="h-[22px] w-[85%] rounded-lg bg-white/5 animate-[skel-shimmer_1.5s_ease-in-out_infinite]" />
      <div className="h-[14px] rounded-lg bg-white/5 animate-[skel-shimmer_1.5s_ease-in-out_infinite]" />
      <div className="h-[14px] w-[70%] rounded-lg bg-white/5 animate-[skel-shimmer_1.5s_ease-in-out_infinite]" />
      <div className="h-[14px] w-[55%] mt-1 rounded-lg bg-white/5 animate-[skel-shimmer_1.5s_ease-in-out_infinite]" />
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
        const data = Array.isArray(res) ? res : (res?.data || res?.articles || [])
        if (!Array.isArray(data)) {
           console.error('API did not return an array:', res)
           setArticles([])
           return
        }
        setArticles(data.filter(a => a.status === 'published' || !a.status))
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err)
        setError('Unable to load articles. Please check your connection.')
        setArticles([])
      })
      .finally(() => setLoading(false))
  }, [])

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
    <>
      <style>
        {`
          @keyframes skel-shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}
      </style>
      <div className="min-h-screen bg-background-primary font-sans text-primary">
        {/* ── Page Header ─────────────────────────── */}
        <header className="pt-[5rem] pb-[3rem] px-[2rem] max-md:pt-[3.5rem] max-md:px-[1.5rem] max-md:pb-[2rem] text-center border-b border-glass-border bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.08),transparent_70%)]">
          <motion.div className="max-w-[640px] mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-[0.5rem] text-accent-purple text-[0.8rem] font-semibold tracking-[0.08em] uppercase mb-[1.25rem]">
              <BookOpen size={16} />
              <span>IHM Aurangabad Journal</span>
            </div>
            <h1 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-bold text-primary m-0 mb-[0.875rem] tracking-[-0.02em]">Stories &amp; Insights</h1>
            <p className="text-[1.05rem] text-secondary leading-[1.65] m-0">Curated articles on food culture, dining, events and hospitality from the heart of Aurangabad.</p>
          </motion.div>
        </header>

        {/* ── Hero / Featured Post ─────────────────── */}
        <AnimatePresence mode="wait">
          {!loading && hero && (
            <motion.section
              className="max-w-[1200px] mx-auto my-[3rem] px-[2rem] max-md:my-[2rem] max-md:px-[1rem]"
              key={hero._id || hero.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to={`/articles/${hero.slug}`} className="block no-underline text-inherit hover:text-inherit focus:text-inherit">
                <div className="grid grid-cols-[1fr_1fr] max-md:grid-cols-1 gap-0 rounded-[1.5rem] overflow-hidden bg-background-secondary border border-glass-border transition-all duration-300 hover:shadow-glow group">
                  <div className="relative h-[420px] max-md:h-[260px] overflow-hidden">
                    <img src={hero.image} alt={hero.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background-secondary/90 max-md:bg-gradient-to-t max-md:from-background-secondary/90 max-md:to-transparent" />
                    {hero.featured && (
                      <div className="absolute top-[1rem] left-[1rem] flex items-center gap-[0.35rem] bg-accent-purple text-white py-[0.3rem] px-[0.75rem] rounded-full text-[0.75rem] font-semibold">
                        <Star size={12} /> Featured
                      </div>
                    )}
                  </div>
                  <div className="p-[2.5rem] flex flex-col justify-center gap-[1rem]">
                    <span className="inline-block self-start py-[0.25rem] px-[0.7rem] bg-accent-purple/12 border border-accent-purple/25 rounded-full text-[0.72rem] font-semibold text-accent-purple tracking-[0.04em] uppercase">{hero.category}</span>
                    <h2 className="font-serif text-[clamp(1.3rem,2.5vw,1.9rem)] font-bold text-primary leading-[1.35] m-0 tracking-[-0.01em]">{hero.title}</h2>
                    <p className="text-[0.975rem] text-secondary leading-[1.7] m-0 line-clamp-3">{hero.excerpt}</p>
                    <div className="flex items-center gap-[0.6rem] text-[0.82rem] text-tertiary flex-wrap">
                      <span className="flex items-center gap-[0.5rem] text-primary font-medium">
                        <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-accent-purple to-[#7c3aed] flex items-center justify-center text-[0.72rem] font-bold text-white shrink-0">{authorName(hero.author)?.[0] || 'I'}</div>
                        {authorName(hero.author)}
                      </span>
                      <span className="w-[3px] h-[3px] bg-glass-border rounded-full" />
                      <span>{formatDate(hero.publishedDate)}</span>
                      <span className="w-[3px] h-[3px] bg-glass-border rounded-full" />
                      <Clock size={13} />
                      <span>{hero.readTime}</span>
                    </div>
                    <div className="inline-flex items-center gap-[0.5rem] text-accent-purple text-[0.9rem] font-semibold mt-[0.5rem] transition-[gap] duration-200 group-hover:gap-[0.75rem]">
                      Read Article <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Controls: search + category pills ────── */}
        <div className="bg-background-primary/80 border-t border-glass-border border-b sticky top-0 z-50 backdrop-blur-[12px]">
          <div className="max-w-[1200px] mx-auto py-[0.875rem] px-[2rem] max-md:py-[0.75rem] max-md:px-[1rem] flex items-center gap-[1.5rem] flex-wrap">
            <div className="flex items-center gap-[0.5rem] bg-glass-surface border border-glass-border rounded-[0.6rem] py-[0.4rem] px-[0.75rem] shrink-0 text-tertiary">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search articles..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-primary text-[0.875rem] w-[200px] max-md:w-[140px] placeholder:text-tertiary"
              />
            </div>
            <div className="flex gap-[0.4rem] flex-wrap">
              {dynamicCategories.map(c => (
                <button
                  key={c}
                  className={`py-[0.3rem] px-[0.85rem] rounded-full text-[0.82rem] font-medium border border-[transparent] bg-transparent text-secondary cursor-pointer transition-all duration-[0.18s] hover:bg-glass-surface hover:text-primary ${category === c ? '!bg-accent-purple/12 !border-accent-purple !text-accent-purple' : 'border-glass-border'}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Article Grid ─────────────────────────── */}
        <main className="max-w-[1200px] mx-auto my-[3rem] px-[2rem] max-md:my-[2rem] max-md:px-[1rem]">
          <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[1.75rem]">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : rest.map((article, i) => (
                  <motion.article
                    key={article._id || article.id}
                    className="bg-background-secondary border border-glass-border rounded-[1.25rem] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-glass group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                  >
                    <Link to={`/articles/${article.slug}`} className="block no-underline text-inherit h-full">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
                        <span className="absolute top-[0.75rem] left-[0.75rem] inline-block py-[0.25rem] px-[0.7rem] bg-accent-purple/12 border border-accent-purple/25 rounded-full text-[0.72rem] font-semibold text-accent-purple tracking-[0.04em] uppercase shadow-md backdrop-blur-md">{article.category}</span>
                      </div>
                      <div className="p-[1.25rem] flex flex-col gap-[0.5rem]">
                        <h3 className="font-serif text-[1rem] font-bold text-primary leading-[1.45] m-0 tracking-[-0.01em] line-clamp-2">{article.title}</h3>
                        <p className="text-[0.85rem] text-secondary leading-[1.6] m-0 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between mt-[0.5rem]">
                          <span className="flex items-center gap-[0.5rem] text-primary font-medium text-[0.82rem]">
                            <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-accent-purple to-[#7c3aed] flex items-center justify-center text-[0.65rem] font-bold text-white shrink-0">{authorName(article.author)?.[0] || 'I'}</div>
                            {authorName(article.author)}
                          </span>
                          <span className="flex items-center gap-[0.3rem] text-[0.76rem] text-tertiary">
                            <Clock size={12} />
                            {article.readTime}
                          </span>
                        </div>
                        <div className="text-[0.75rem] text-tertiary">{formatDate(article.publishedDate)}</div>
                      </div>
                    </Link>
                  </motion.article>
                ))
            }
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-[5rem] px-[2rem] text-tertiary flex flex-col items-center gap-[0.875rem]">
              <BookOpen size={40} />
              <p>No articles found.</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default Articles