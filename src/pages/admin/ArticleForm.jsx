import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, Tag, Clock, Settings2, Link as LinkIcon, Send, FileText, Image as ImageIcon } from 'lucide-react';
import { articlesApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import RichTextEditor from '../../components/admin/RichTextEditor';

// Generate a URL-safe slug from the title
const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// Articles are sent as JSON, so an uploaded File must be turned into a base64
// data-URI string — the backend decodes that and stores it on S3. (A raw File
// would JSON-serialize to {} and fail the model's string validation.)
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

// Shared field styles for the settings drawer.
const fieldCls = 'w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-3 text-white text-[0.9rem] outline-none transition-all focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20';
const labelCls = 'block text-[0.78rem] font-semibold uppercase tracking-wide text-gray-500 mb-1.5';

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageMode, setImageMode] = useState('url');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [slugManual, setSlugManual] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const { adminUser } = useAdminAuth();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
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

  // Open the settings drawer by default on desktop, closed on small screens.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setShowSettings(false);
  }, []);

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
      if (name === 'title' && !slugManual) updated.slug = slugify(value);
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

  // Single save path; `statusOverride` lets the top-bar buttons publish or save a draft.
  const save = async (statusOverride) => {
    if (!formData.title.trim()) {
      showToast.error('Validation', 'Please add a title');
      return;
    }
    const hasImage = imageMode === 'file' ? !!imageFile : !!formData.image;
    if (!hasImage) {
      setShowSettings(true);
      showToast.error('Validation', 'Please add a cover image (in Post settings)');
      return;
    }
    const hasContent = /<img/i.test(formData.content) ||
      formData.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
    if (!hasContent) {
      showToast.error('Validation', 'Please write some article content');
      return;
    }

    const status = statusOverride || formData.status;
    setLoading(true);
    try {
      // In upload mode, send the picked file as a base64 data-URI; otherwise keep
      // the URL (or the existing image when editing without a new upload).
      const image = imageMode === 'file' && imageFile
        ? await fileToDataUrl(imageFile)
        : formData.image;

      const payload = {
        ...formData,
        status,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        image,
      };

      if (isEditMode) {
        await articlesApi.update(id, payload);
        showToast.success('Success', status === 'published' ? 'Article published' : 'Article saved');
      } else {
        await articlesApi.create(payload);
        showToast.success('Success', status === 'published' ? 'Article published' : 'Draft saved');
      }
      setFormData(prev => ({ ...prev, status }));
      navigate('/admin/articles');
    } catch {
      showToast.error('Error', isEditMode ? 'Failed to update article' : 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#0e0e16] text-gray-500 data-[theme=light]:bg-gray-50 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <Loader size={48} className="animate-spin mb-4 text-purple-500" />
      <p className="m-0">Loading article…</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#0e0e16] data-[theme=light]:bg-gray-50 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* ── Top action bar ── */}
      <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-3 md:px-5 border-b border-white/10 bg-[#0e0e16]/90 backdrop-blur-md data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/admin/articles')} title="Back to articles"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all shrink-0 data-[theme=light]:hover:bg-black/5 data-[theme=light]:text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <span className="text-gray-300 font-semibold text-[0.95rem] truncate data-[theme=light]:text-gray-800">
            {isEditMode ? 'Edit article' : 'New article'}
          </span>
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[0.7rem] font-semibold uppercase tracking-wide shrink-0 ${formData.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
            {formData.status}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loading && <Loader size={18} className="animate-spin text-purple-400" />}
          <button onClick={() => save('draft')} disabled={loading}
            className="flex items-center gap-2 py-2 px-3.5 rounded-lg text-[0.85rem] font-semibold text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50 data-[theme=light]:text-gray-600 data-[theme=light]:border-black/15 data-[theme=light]:hover:bg-black/5">
            <Save size={16} /> <span className="max-sm:hidden">Save draft</span>
          </button>
          <button onClick={() => save('published')} disabled={loading}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-[0.85rem] font-semibold text-white bg-purple-500 hover:bg-purple-600 transition-all disabled:opacity-60">
            <Send size={16} /> {isEditMode ? 'Update' : 'Publish'}
          </button>
          <button onClick={() => setShowSettings(s => !s)} title="Post settings"
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all shrink-0 ${showSettings ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'text-gray-400 border-white/10 hover:bg-white/5 hover:text-white data-[theme=light]:text-gray-600 data-[theme=light]:border-black/15'}`}>
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* ── Body: writing canvas + settings drawer ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Writing canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[780px] mx-auto px-5 md:px-8">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full bg-transparent border-none outline-none text-gray-100 data-[theme=light]:text-gray-900 text-[2rem] md:text-[2.6rem] font-bold tracking-[-0.02em] leading-tight pt-8 pb-3 placeholder:text-gray-600"
            />
            <RichTextEditor
              bare
              value={formData.content}
              onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
              placeholder="Tell your story… use the toolbar to add headings, bold, lists, links and images."
            />
          </div>
        </main>

        {/* Backdrop (mobile) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="absolute inset-0 bg-black/50 z-[10] lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>

        {/* Settings drawer */}
        <AnimatePresence>
          {showSettings && (
            <motion.aside
              className="absolute lg:relative top-0 right-0 h-full w-[340px] max-w-[88vw] z-[20] flex flex-col border-l border-white/10 bg-[#13131d] data-[theme=light]:bg-white data-[theme=light]:border-black/10 shadow-[-8px_0_30px_rgba(0,0,0,0.3)]"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-white/10 data-[theme=light]:border-black/10">
                <span className="text-[0.85rem] font-semibold text-gray-200 data-[theme=light]:text-gray-800 flex items-center gap-2">
                  <Settings2 size={15} className="text-purple-400" /> Post settings
                </span>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white transition-all"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                {/* Cover image */}
                <div>
                  <span className={labelCls}><ImageIcon size={12} className="inline mr-1 -mt-0.5" /> Cover image *</span>
                  <div className="flex gap-1.5 mb-2.5">
                    <button type="button" onClick={() => setImageMode('url')}
                      className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-md text-[0.78rem] font-medium transition-all ${imageMode === 'url' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 data-[theme=light]:bg-black/5 data-[theme=light]:text-gray-600'}`}>
                      <LinkIcon size={12} /> URL
                    </button>
                    <button type="button" onClick={() => setImageMode('file')}
                      className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-md text-[0.78rem] font-medium transition-all ${imageMode === 'file' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 data-[theme=light]:bg-black/5 data-[theme=light]:text-gray-600'}`}>
                      <Upload size={12} /> Upload
                    </button>
                  </div>
                  {imageMode === 'url' && (
                    <input className={fieldCls + ' mb-2.5'} type="url" placeholder="https://example.com/cover.jpg" value={formData.image} onChange={handleImageUrlChange} />
                  )}
                  <div className="w-full aspect-[16/10] rounded-lg overflow-hidden relative">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                        <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500 transition-all"><X size={14} /></button>
                      </>
                    ) : imageMode === 'file' ? (
                      <label className="w-full h-full border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-all data-[theme=light]:border-black/20">
                        <Upload size={24} /><span className="text-[0.8rem]">Upload cover</span>
                        <input type="file" hidden onChange={handleImageFileChange} accept="image/*" />
                      </label>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-600 bg-black/20 data-[theme=light]:border-black/20">
                        <LinkIcon size={22} /><span className="text-[0.78rem]">Paste a URL to preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <span className={labelCls}>Excerpt</span>
                  <textarea className={fieldCls + ' resize-y min-h-[72px]'} name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short preview shown in the article list…" rows="3" />
                </div>

                {/* Category + read time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className={labelCls}>Category</span>
                    <select className={fieldCls} name="category" value={formData.category} onChange={handleChange}>
                      <option value="news">News</option>
                      <option value="features">Features</option>
                      <option value="interviews">Interviews</option>
                      <option value="guides">Guides</option>
                      <option value="awards">Awards</option>
                    </select>
                  </div>
                  <div>
                    <span className={labelCls}><Clock size={11} className="inline mr-1 -mt-0.5" /> Read time</span>
                    <input className={fieldCls} name="readTime" value={formData.readTime} onChange={handleChange} placeholder="5 min read" />
                  </div>
                </div>

                {/* Published date */}
                <div>
                  <span className={labelCls}>Published date</span>
                  <input className={fieldCls} type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} />
                </div>

                {/* Slug */}
                <div>
                  <span className={labelCls}>Permalink (slug)</span>
                  <input className={fieldCls} name="slug" value={formData.slug} onChange={handleChange} placeholder="secret-spices-aurangabad" />
                </div>

                {/* Tags */}
                <div>
                  <span className={labelCls}><Tag size={11} className="inline mr-1 -mt-0.5" /> Tags</span>
                  <input className={fieldCls} name="tags" value={formData.tags} onChange={handleChange} placeholder="food, travel, history" />
                  <span className="text-[0.72rem] text-gray-600 mt-1 block">Separate with commas</span>
                </div>

                {/* Status */}
                <div>
                  <span className={labelCls}>Status</span>
                  <select className={fieldCls} name="status" value={formData.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Featured */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer hover:border-purple-500/50 transition-all data-[theme=light]:border-black/10 group">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-600" name="featured" checked={formData.featured} onChange={handleChange} />
                  <span className="flex flex-col">
                    <span className="text-gray-200 font-medium text-[0.88rem] flex items-center gap-1.5 data-[theme=light]:text-gray-800 group-hover:text-purple-400"><FileText size={13} /> Featured article</span>
                    <span className="text-gray-500 text-[0.78rem] mt-0.5">Highlight on the articles section</span>
                  </span>
                </label>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ArticleForm;
