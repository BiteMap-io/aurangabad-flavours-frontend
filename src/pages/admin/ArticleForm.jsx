import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, Tag, Clock, FileText, Link as LinkIcon } from 'lucide-react';
import { articlesApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';

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
  const [slugManual, setSlugManual] = useState(false);

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
        image: imageMode === 'file' ? imageFile : formData.image,
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
    <div className="flex flex-col items-center justify-center h-[400px] color-gray-500 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <Loader size={48} className="animate-spin mb-4 text-purple-500" />
      <p className="m-0 text-gray-500">Loading article...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex flex-col gap-4 mb-8">
        <button className="flex items-center gap-2 bg-transparent border-none text-purple-500 cursor-pointer font-medium w-fit p-0 transition-all duration-200 hover:text-purple-400 hover:-translate-x-1" onClick={() => navigate('/admin/articles')}>
          <ArrowLeft size={20} /><span>Back to Articles</span>
        </button>
        <h1 className="text-[2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">{isEditMode ? 'Edit Article' : 'Write New Article'}</h1>
      </div>

      <motion.div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[1.5fr_1fr] gap-10 max-[1024px]:grid-cols-1">
            <div className="flex flex-col">
              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Article Info</h3>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Title *</label>
                  <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. The Secret Spices of Aurangabad" />
                </div>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Slug * <span className="text-gray-500 font-normal">(auto-generated)</span></label>
                  <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="slug" value={formData.slug} onChange={handleChange} required placeholder="e.g. secret-spices-aurangabad" />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Published Date *</label>
                    <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Category *</label>
                    <select className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="category" value={formData.category} onChange={handleChange} required>
                      <option value="news">News</option>
                      <option value="features">Features</option>
                      <option value="interviews">Interviews</option>
                      <option value="guides">Guides</option>
                      <option value="awards">Awards</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Read Time * <span className="text-gray-500 font-normal">(string)</span></label>
                    <div className="relative flex items-center">
                      <Clock size={16} className="absolute left-4 text-gray-400" />
                      <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 pl-[2.8rem] w-full text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="readTime" value={formData.readTime} onChange={handleChange} required placeholder="5 min read" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Content</h3>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Excerpt * <span className="text-gray-500 font-normal">(shown in list view)</span></label>
                  <textarea className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y min-h-[100px] data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short preview of the article..." rows="3" required />
                </div>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Full Content * <span className="text-gray-500 font-normal">(Markdown supported)</span></label>
                  <textarea className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y min-h-[250px] data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="content" value={formData.content} onChange={handleChange} placeholder="Write the full article here..." rows="14" required />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Cover Image *</h3>
                <div className="flex gap-2 mb-4">
                  <button type="button" className={`flex items-center gap-2 py-2 px-4 rounded-lg border border-transparent transition-all duration-200 font-medium text-[0.9rem] cursor-pointer ${imageMode === 'url' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 data-[theme=light]:bg-black/5 data-[theme=light]:text-gray-600'}`} onClick={() => setImageMode('url')}>
                    <LinkIcon size={14} /> Image URL
                  </button>
                  <button type="button" className={`flex items-center gap-2 py-2 px-4 rounded-lg border border-transparent transition-all duration-200 font-medium text-[0.9rem] cursor-pointer ${imageMode === 'file' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 data-[theme=light]:bg-black/5 data-[theme=light]:text-gray-600'}`} onClick={() => setImageMode('file')}>
                    <Upload size={14} /> Upload
                  </button>
                </div>
                {imageMode === 'url' && (
                  <div className="flex flex-col gap-2 mb-5 mt-3">
                    <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" type="url" placeholder="https://example.com/cover.jpg" value={formData.image} onChange={handleImageUrlChange} />
                  </div>
                )}
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative">
                  {imagePreview ? (
                    <div className="w-full h-full relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                      <button type="button" className="absolute top-2 right-2 bg-black/70 border-none text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-500" onClick={clearImage}><X size={16} /></button>
                    </div>
                  ) : imageMode === 'file' ? (
                    <label className="w-full h-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer text-gray-500 transition-all duration-200 hover:bg-purple-500/5 hover:border-purple-500 hover:text-purple-500 data-[theme=light]:border-black/20">
                      <Upload size={32} /><span>Upload cover image</span>
                      <input type="file" hidden onChange={handleImageFileChange} accept="image/*" />
                    </label>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-gray-500 bg-black/20 data-[theme=light]:border-black/20 data-[theme=light]:bg-black/5">
                      <LinkIcon size={28} /><span>Paste a URL above to preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Tags & Status</h3>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Tags <span className="text-gray-500 font-normal">(comma-separated)</span></label>
                  <div className="relative flex items-center">
                    <Tag size={16} className="absolute left-4 text-gray-400" />
                    <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 pl-[2.8rem] w-full text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="tags" value={formData.tags} onChange={handleChange} placeholder="food, travel, history..." />
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Publication Status</label>
                  <select className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="status" value={formData.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 mt-4 p-4 rounded-xl border border-white/10 bg-black/20 cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 data-[theme=light]:bg-white data-[theme=light]:border-black/10 group">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600" name="featured" checked={formData.featured} onChange={handleChange} />
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-medium flex items-center gap-2 data-[theme=light]:text-gray-900 group-hover:text-purple-500"><FileText size={14} /> Featured Article</span>
                    <span className="text-gray-500 text-[0.85rem] mt-1">Highlight this article on the articles section</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-white/10 data-[theme=light]:border-black/10">
            <button type="button" className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white data-[theme=light]:border-black/20 data-[theme=light]:text-gray-600 data-[theme=light]:hover:text-gray-900 data-[theme=light]:hover:bg-black/5" onClick={() => navigate('/admin/articles')}>Cancel</button>
            <button type="submit" className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-purple-500 text-white border-none hover:bg-purple-600 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(168,85,247,0.3)] disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditMode ? 'Update Article' : 'Save Article'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ArticleForm;
