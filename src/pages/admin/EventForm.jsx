import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, Star, Users, DollarSign, Link as LinkIcon } from 'lucide-react';
import { eventsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import './EventForm.css';

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
        // For events, image is a URL string (backend expects JSON)
        image: imageMode === 'file' ? imagePreview : formData.image,
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
    <div className="form-loading"><Loader size={48} className="spinner" /><p>Loading event...</p></div>
  );

  return (
    <div className="event-form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/admin/events')}>
          <ArrowLeft size={20} /><span>Back to Events</span>
        </button>
        <h1>{isEditMode ? 'Edit Event' : 'Add New Event'}</h1>
      </div>

      <motion.div className="form-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-column">
              <div className="form-section">
                <h3>Event Details</h3>
                <div className="input-group">
                  <label>Event Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Aurangabad Food Festival" />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Location *</label>
                    <input name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Prozone Mall" />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Organizer *</label>
                    <input name="organizer" value={formData.organizer} onChange={handleChange} required placeholder="e.g. IHM Aurangabad" />
                  </div>
                  <div className="input-group">
                    <label>Price *</label>
                    <input name="price" value={formData.price} onChange={handleChange} required placeholder="e.g. Free or ₹200" />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Capacity *</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" placeholder="e.g. 200" />
                  </div>
                  <div className="input-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="upcoming">Upcoming</option>
                      <option value="recurring">Recurring</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Description *</h3>
                <div className="input-group">
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the event..." rows="8" required />
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
                    <Upload size={14} /> Upload File
                  </button>
                </div>
                {imageMode === 'url' && (
                  <div className="input-group" style={{ marginTop: '0.75rem' }}>
                    <input type="url" placeholder="https://example.com/image.jpg" value={formData.image} onChange={handleImageUrlChange} />
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
                      <Upload size={32} /><span>Click to upload event banner</span>
                      <input type="file" hidden onChange={handleImageFileChange} accept="image/*" />
                    </label>
                  ) : (
                    <div className="upload-placeholder-inactive">
                      <LinkIcon size={28} /><span>Paste a URL above to preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section settings-checks">
                <h3>Visibility</h3>
                <label className="checkbox-group">
                  <div className="check-box">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                    <div className="custom-check"></div>
                  </div>
                  <div className="check-text">
                    <span className="label"><Star size={14} /> Featured Event</span>
                    <span className="hint">Promote on the events homepage section</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/events')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader size={18} className="spinner" /> : <Save size={18} />}
              {isEditMode ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EventForm;
