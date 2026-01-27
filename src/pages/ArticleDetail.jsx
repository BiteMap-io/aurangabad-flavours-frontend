import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from 'lucide-react'
import { getArticleBySlug, getRelatedArticles } from '../data/articles'
import './ArticleDetail.css'

const ArticleDetail = () => {
  const { slug } = useParams()
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <div className="article-not-found">
        <h1>Article Not Found</h1>
        <p>The article you're looking for doesn't exist.</p>
        <Link to="/articles" className="back-to-articles">
          <ArrowLeft size={16} />
          Back to Articles
        </Link>
      </div>
    )
  }

  const relatedArticles = getRelatedArticles(article.id, article.category)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="article-detail-page">
      {/* Hero Section */}
      <section className="article-hero">
        <div className="article-hero-image">
          <img src={article.image} alt={article.title} />
          <div className="article-hero-overlay" />
        </div>
        <div className="article-hero-content">
          <div className="article-breadcrumb">
            <Link to="/articles" className="breadcrumb-link">
              <ArrowLeft size={16} />
              Articles
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-category">{article.category}</span>
          </div>
          <motion.div
            className="article-hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="article-category-badge">{article.category}</div>
            <h1 className="article-hero-title">{article.title}</h1>
            <div className="article-hero-meta">
              <span className="article-author">
                <User size={16} />
                {article.author}
              </span>
              <span className="article-date">
                <Calendar size={16} />
                {formatDate(article.publishDate)}
              </span>
              <span className="article-read-time">
                <Clock size={16} />
                {article.readTime}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <article className="article-content-section">
        <div className="article-content-container">
          <motion.div
            className="article-excerpt-highlight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>{article.excerpt}</p>
          </motion.div>

          <motion.div
            className="article-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="related-articles-section">
          <div className="related-articles-container">
            <h2 className="related-articles-title">Related Articles</h2>
            <div className="related-articles-grid">
              {relatedArticles.map((relatedArticle, index) => (
                <motion.article
                  key={relatedArticle.id}
                  className="related-article-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Link to={`/articles/${relatedArticle.slug}`} className="related-article-link">
                    <div className="related-article-image">
                      <img src={relatedArticle.image} alt={relatedArticle.title} />
                    </div>
                    <div className="related-article-content">
                      <h3 className="related-article-title">{relatedArticle.title}</h3>
                      <p className="related-article-excerpt">{relatedArticle.excerpt}</p>
                      <div className="related-article-meta">
                        <span className="related-article-date">
                          {formatDate(relatedArticle.publishDate)}
                        </span>
                        <span className="related-article-read-time">
                          {relatedArticle.readTime}
                        </span>
                      </div>
                      <div className="read-more">
                        <span>Read Article</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Articles */}
      <section className="article-navigation">
        <div className="article-navigation-container">
          <Link to="/articles" className="back-to-articles-btn">
            <ArrowLeft size={16} />
            Back to All Articles
          </Link>
        </div>
      </section>
    </div>
  )
}

export default ArticleDetail