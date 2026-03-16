import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, Tag, Clock, FileText, Link as LinkIcon } from 'lucide-react';
import { articlesApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import './ArticleForm.css';

/**
 * ArticleForm – aligned with backend Article model:
 *   Required: title, slug, excerpt, content, image, author (User ObjectId),
 *             category, publishedDate (Date), readTime (string e.g. "5 min read")
 *   Optional: tags ([String]), status (draft/published), featured
 */

// Generate a URL-safe slug from the title
const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageMode, setImageMode] = useState('url');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [slugManual, setSlugManual] = useState(false); // prevent auto-slug if user edited manually

  const { adminUser } = useAdminAuth();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',          // User ObjectId
    publishedDate: new Date().toISOString().split('T')[0],
    excerpt: '',
    content: '',
    category: 'news',
    status: 'draft',
    image: '',
    readTime: '5 min read',
    tags: '',
    featured: false,
  });

  useEffect(() => {
    if (!isEditMode && adminUser?._id) {
      setFormData(prev => ({ ...prev, author: adminUser._id }));
    }
  }, [adminUser, isEditMode]);

  useEffect(() => {
    if (isEditMode) loadArticleData();
  }, [id]);

  const loadArticleData = async () => {
    try {
      setInitialLoading(true);
      const response = await articlesApi.getById(id);
      const data = response.data || response;
      if (data) {
        const formattedDate = data.publishedDate ? new Date(data.publishedDate).toISOString().split('T')[0] : '';
        setFormData({
          ...data,
          publishedDate: formattedDate,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
          image: typeof data.image === 'string' ? data.image : '',
          author: typeof data.author === 'object' ? data.author?._id || data.author?.id || '' : data.author || '',
        });
        if (data.image) { setImagePreview(data.image); setImageMode('url'); }
        setSlugManual(true);
      }
    } catch {
      showToast.error('Error', 'Failed to load article data');
      navigate('/admin/articles');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Auto-generate slug from title unless user manually edited it
      if (name === 'title' && !slugManual) {
        updated.slug = slugify(value);
      }
      if (name === 'slug') setSlugManual(true);
      return updated;
    });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url || null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasImage = imageMode === 'file' ? !!imageFile : !!formData.image;
    if (!hasImage) {
      showToast.error('Validation', 'Please provide a cover image URL or upload an image');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        image: imageMode === 'file' ? imagePreview : formData.image,
      };

      if (isEditMode) {
        await articlesApi.update(id, payload);
        showToast.success('Success', 'Article updated successfully');
      } else {
        await articlesApi.create(payload);
        showToast.success('Success', 'Article created successfully');
      }
      navigate('/admin/articles');
    } catch {
      showToast.error('Error', isEditMode ? 'Failed to update article' : 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="form-loading"><Loader size={48} className="spinner" /><p>Loading article...</p></div>
  );

  return (
    <div className="article-form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/admin/articles')}>
          <ArrowLeft size={20} /><span>Back to Articles</span>
        </button>
        <h1>{isEditMode ? 'Edit Article' : 'Write New Article'}</h1>
      </div>

      <motion.div className="form-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-column">
              <div className="form-section">
                <h3>Article Info</h3>
                <div className="input-group">
                  <label>Title *</label>
                  <input name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. The Secret Spices of Aurangabad" />
                </div>
                <div className="input-group">
                  <label>Slug * <span style={{ color: '#6b7280', fontWeight: 400 }}>(auto-generated)</span></label>
                  <input name="slug" value={formData.slug} onChange={handleChange} required placeholder="e.g. secret-spices-aurangabad" />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Published Date *</label>
                    <input type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} required />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                      <option value="news">News</option>
                      <option value="features">Features</option>
                      <option value="interviews">Interviews</option>
                      <option value="guides">Guides</option>
                      <option value="awards">Awards</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Read Time * <span style={{ color: '#6b7280', fontWeight: 400 }}>(string)</span></label>
                    <div className="input-with-icon">
                      <Clock size={16} />
                      <input name="readTime" value={formData.readTime} onChange={handleChange} required placeholder="5 min read" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Content</h3>
                <div className="input-group">
                  <label>Excerpt * <span style={{ color: '#6b7280', fontWeight: 400 }}>(shown in list view)</span></label>
                  <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short preview of the article..." rows="3" required />
                </div>
                <div className="input-group">
                  <label>Full Content * <span style={{ color: '#6b7280', fontWeight: 400 }}>(Markdown supported)</span></label>
                  <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Write the full article here..." rows="14" required />
                </div>
              </div>
            </div>

            <div className="form-column">
              <div className="form-section">
                <h3>Cover Image *</h3>
                <div className="image-mode-tabs">
                  <button type="button" className={`mode-tab ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>
                    <LinkIcon size={14} /> Image URL
                  </button>
                  <button type="button" className={`mode-tab ${imageMode === 'file' ? 'active' : ''}`} onClick={() => setImageMode('file')}>
                    <Upload size={14} /> Upload
                  </button>
                </div>
                {imageMode === 'url' && (
                  <div className="input-group" style={{ marginTop: '0.75rem' }}>
                    <input type="url" placeholder="https://example.com/cover.jpg" value={formData.image} onChange={handleImageUrlChange} />
                  </div>
                )}
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" onError={() => setImagePreview(null)} />
                      <button type="button" className="remove-image" onClick={clearImage}><X size={16} /></button>
                    </div>
                  ) : imageMode === 'file' ? (
                    <label className="upload-placeholder">
                      <Upload size={32} /><span>Upload cover image</span>
                      <input type="file" hidden onChange={handleImageFileChange} accept="image/*" />
                    </label>
                  ) : (
                    <div className="upload-placeholder-inactive">
                      <LinkIcon size={28} /><span>Paste a URL above to preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Tags & Status</h3>
                <div className="input-group">
                  <label>Tags <span style={{ color: '#6b7280', fontWeight: 400 }}>(comma-separated)</span></label>
                  <div className="input-with-icon">
                    <Tag size={16} />
                    <input name="tags" value={formData.tags} onChange={handleChange} placeholder="food, travel, history..." />
                  </div>
                </div>
                <div className="input-group">
                  <label>Publication Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <label className="checkbox-group" style={{ marginTop: '0.5rem' }}>
                  <div className="check-box">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                    <div className="custom-check"></div>
                  </div>
                  <div className="check-text">
                    <span className="label"><FileText size={14} /> Featured Article</span>
                    <span className="hint">Highlight this article on the articles section</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/articles')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader size={18} className="spinner" /> : <Save size={18} />}
              {isEditMode ? 'Update Article' : 'Save Article'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ArticleForm;
