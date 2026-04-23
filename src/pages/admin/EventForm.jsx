import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, Star, Users, DollarSign, Link as LinkIcon, MapPin, Calendar, CheckSquare } from 'lucide-react';
import { eventsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';

/**
 * EventForm – aligned with backend Event model:
 *   Required: name, description, date, location, image, organizer, price, capacity
 *   Optional: status (upcoming/recurring/past), featured
 */
const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageMode, setImageMode] = useState('url');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',           // backend uses 'name' not 'title'
    description: '',
    date: '',
    location: '',
    image: '',          // URL string
    organizer: '',      // required
    price: '',          // required (string e.g. "Free" or "₹200")
    capacity: '',       // required (number)
    status: 'upcoming',
    featured: false,
  });

  useEffect(() => {
    if (isEditMode) loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      setInitialLoading(true);
      const response = await eventsApi.getById(id);
      const data = response.data || response;
      if (data) {
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
        setFormData({ ...data, date: formattedDate, image: typeof data.image === 'string' ? data.image : '' });
        if (data.image) { setImagePreview(data.image); setImageMode('url'); }
      }
    } catch {
      showToast.error('Error', 'Failed to load event data');
      navigate('/admin/events');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      showToast.error('Validation', 'Please provide an image URL or upload an image');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        image: imageMode === 'file' ? imageFile : formData.image,
      };

      if (isEditMode) {
        await eventsApi.update(id, payload);
        showToast.success('Success', 'Event updated successfully');
      } else {
        await eventsApi.create(payload);
        showToast.success('Success', 'Event created successfully');
      }
      navigate('/admin/events');
    } catch {
      showToast.error('Error', isEditMode ? 'Failed to update event' : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center h-[400px] color-gray-500 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <Loader size={48} className="animate-spin mb-4 text-purple-500" />
      <p className="m-0 text-gray-500">Loading event...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex flex-col gap-4 mb-8">
        <button className="flex items-center gap-2 bg-transparent border-none text-purple-500 cursor-pointer font-medium w-fit p-0 transition-all duration-200 hover:text-purple-400 hover:-translate-x-1" onClick={() => navigate('/admin/events')}>
          <ArrowLeft size={20} /><span>Back to Events</span>
        </button>
        <h1 className="text-[2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">{isEditMode ? 'Edit Event' : 'Add New Event'}</h1>
      </div>

      <motion.div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[1.5fr_1fr] gap-10 max-[1024px]:grid-cols-1">
            <div className="flex flex-col">
              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Event Details</h3>
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Event Name *</label>
                  <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Aurangabad Food Festival" />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Date *</label>
                    <div className="relative flex items-center">
                      <Calendar size={16} className="absolute left-4 text-gray-400" />
                      <input className="bg-black/30 w-full pl-[2.8rem] border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Location *</label>
                    <div className="relative flex items-center">
                      <MapPin size={16} className="absolute left-4 text-gray-400" />
                      <input className="bg-black/30 w-full pl-[2.8rem] border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Prozone Mall" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Organizer *</label>
                    <div className="relative flex items-center">
                      <Users size={16} className="absolute left-4 text-gray-400" />
                       <input className="bg-black/30 w-full pl-[2.8rem] border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="organizer" value={formData.organizer} onChange={handleChange} required placeholder="e.g. IHM Aurangabad" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Price *</label>
                    <div className="relative flex items-center">
                      <DollarSign size={16} className="absolute left-4 text-gray-400" />
                      <input className="bg-black/30 w-full pl-[2.8rem] border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="price" value={formData.price} onChange={handleChange} required placeholder="e.g. Free or ₹200" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Capacity *</label>
                    <div className="relative flex items-center">
                      <Users size={16} className="absolute left-4 text-gray-400" />
                      <input className="bg-black/30 w-full pl-[2.8rem] border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" placeholder="e.g. 200" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Status</label>
                    <div className="relative flex items-center">
                      <CheckSquare size={16} className="absolute left-4 text-gray-400" />
                      <select className="bg-black/30 w-full pl-[2.8rem] border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="status" value={formData.status} onChange={handleChange}>
                        <option value="upcoming">Upcoming</option>
                        <option value="recurring">Recurring</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Description *</h3>
                <div className="flex flex-col gap-2 mb-5">
                  <textarea className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y min-h-[250px] data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the event..." rows="8" required />
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
                    <Upload size={14} /> Upload File
                  </button>
                </div>
                {imageMode === 'url' && (
                  <div className="flex flex-col gap-2 mb-5 mt-3">
                    <input className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" type="url" placeholder="https://example.com/image.jpg" value={formData.image} onChange={handleImageUrlChange} />
                  </div>
                )}
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative">
                  {imagePreview ? (
                    <div className="w-full h-full relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                      <button type="button" className="absolute top-2 right-2 bg-black/70 border-none text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-500" onClick={clearImage}><X size={16} /></button>
                    </div>
                  ) : imageMode === 'file' ? (
                     <label className="w-full h-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer text-gray-500 transition-all duration-200 hover:bg-purple-500/5 hover:border-purple-500 hover:text-purple-500 data-[theme=light]:border-black/20">
                      <Upload size={32} /><span>Click to upload event banner</span>
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
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Visibility</h3>
                <label className="flex items-start gap-3 mt-4 p-4 rounded-xl border border-white/10 bg-black/20 cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 data-[theme=light]:bg-white data-[theme=light]:border-black/10 group">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600" name="featured" checked={formData.featured} onChange={handleChange} />
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-medium flex items-center gap-2 data-[theme=light]:text-gray-900 group-hover:text-purple-500"><Star size={14} /> Featured Event</span>
                    <span className="text-gray-500 text-[0.85rem] mt-1">Promote on the events homepage section</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-white/10 data-[theme=light]:border-black/10">
            <button type="button" className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white data-[theme=light]:border-black/20 data-[theme=light]:text-gray-600 data-[theme=light]:hover:text-gray-900 data-[theme=light]:hover:bg-black/5" onClick={() => navigate('/admin/events')}>Cancel</button>
            <button type="submit" className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-purple-500 text-white border-none hover:bg-purple-600 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(168,85,247,0.3)] disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditMode ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EventForm;
