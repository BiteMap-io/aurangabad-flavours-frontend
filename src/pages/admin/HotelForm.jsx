import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, MapPin, Star, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { hotelsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import './HotelForm.css';

const ESTABLISHMENT_TYPES = ['Restaurant', 'Hotel', 'Cafe', 'Dhaba', 'Fine Dining', 'Street Food', 'Bakery', 'Food Court'];

const HotelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [formData, setFormData] = useState({
    name: '',
    establishmentType: 'Restaurant',
    cuisine: '',
    area: '',
    priceRange: '₹₹',
    rating: 4.5,
    ihmRecommended: false,
    verified: false,
    image: '',   // URL string by default
    address: '',
    description: '',
    facilities: '',
    location: {
      type: 'Point',
      coordinates: [75.3433, 19.8762]
    }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      loadHotelData();
    }
  }, [id]);

  const loadHotelData = async () => {
    try {
      setInitialLoading(true);
      const response = await hotelsApi.getById(id);
      const data = response.data || response;
      if (data) {
        setFormData({
          ...data,
          facilities: Array.isArray(data.facilities) ? data.facilities.join(', ') : data.facilities || '',
          image: typeof data.image === 'string' ? data.image : '',
        });
        if (typeof data.image === 'string' && data.image) {
          setImagePreview(data.image);
          setImageMode('url');
        }
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load hotel data');
      navigate('/admin/hotels');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoordinateChange = (index, value) => {
    const newCoords = [...formData.location.coordinates];
    newCoords[index] = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, coordinates: newCoords }
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
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

    // Validate image
    const hasImage = imageMode === 'file' ? !!imageFile : !!formData.image;
    if (!hasImage) {
      showToast.error('Validation', 'Please provide an image URL or upload an image file');
      return;
    }

    setLoading(true);

    try {
      // Build submission payload
      const payload = {
        ...formData,
        facilities: formData.facilities
          ? formData.facilities.split(',').map(f => f.trim()).filter(Boolean)
          : [],
        image: imageMode === 'file' ? imageFile : formData.image,
      };

      if (isEditMode) {
        await hotelsApi.update(id, payload);
        showToast.success('Success', 'Hotel updated successfully');
      } else {
        await hotelsApi.create(payload);
        showToast.success('Success', 'Hotel created successfully');
      }
      navigate('/admin/hotels');
    } catch (error) {
      showToast.error('Error', isEditMode ? 'Failed to update hotel' : 'Failed to create hotel');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="form-loading">
        <Loader size={48} className="spinner" />
        <p>Loading hotel information...</p>
      </div>
    );
  }

  return (
    <div className="hotel-form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/admin/hotels')}>
          <ArrowLeft size={20} />
          <span>Back to Management</span>
        </button>
        <h1>{isEditMode ? 'Edit Hotel / Restaurant' : 'Add New Hotel / Restaurant'}</h1>
      </div>

      <motion.div
        className="form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="input-group">
                  <label>Restaurant / Hotel Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Tandoor Restaurant"
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Establishment Type *</label>
                    <select name="establishmentType" value={formData.establishmentType} onChange={handleInputChange} required>
                      {ESTABLISHMENT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Cuisine Type *</label>
                    <input
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. North Indian, Mughlai"
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Area / Locality *</label>
                    <input
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Nirala Bazar"
                    />
                  </div>
                  <div className="input-group">
                    <label>Price Range *</label>
                    <select name="priceRange" value={formData.priceRange} onChange={handleInputChange} required>
                      <option value="₹">₹ (Budget)</option>
                      <option value="₹₹">₹₹ (Moderate)</option>
                      <option value="₹₹₹">₹₹₹ (Premium)</option>
                      <option value="₹₹₹₹">₹₹₹₹ (Luxury)</option>
                    </select>
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Rating (1–5)</label>
                    <input
                      type="number" step="0.1" min="1" max="5"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group">
                    <label>Facilities (comma-separated)</label>
                    <input
                      name="facilities"
                      value={formData.facilities}
                      onChange={handleInputChange}
                      placeholder="WiFi, Parking, AC..."
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Full Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address..."
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Description *</h3>
                <div className="input-group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell visitors something about this place..."
                    rows="6"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
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

                {imageMode === 'url' ? (
                  <div className="input-group" style={{ marginTop: '0.75rem' }}>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleImageUrlChange}
                    />
                  </div>
                ) : null}

                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" onError={() => setImagePreview(null)} />
                      <button type="button" className="remove-image" onClick={clearImage}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : imageMode === 'file' ? (
                    <label className="upload-placeholder">
                      <Upload size={32} />
                      <span>Click to upload image</span>
                      <input type="file" hidden onChange={handleImageFileChange} accept="image/*" />
                    </label>
                  ) : (
                    <div className="upload-placeholder-inactive">
                      <LinkIcon size={28} />
                      <span>Paste an image URL above to preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Location Coordinates</h3>
                <div className="coordinate-inputs">
                  <div className="input-group">
                    <label>Longitude</label>
                    <input
                      type="number" step="any"
                      value={formData.location.coordinates[0]}
                      onChange={(e) => handleCoordinateChange(0, e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Latitude</label>
                    <input
                      type="number" step="any"
                      value={formData.location.coordinates[1]}
                      onChange={(e) => handleCoordinateChange(1, e.target.value)}
                    />
                  </div>
                </div>
                <p className="coord-hint"><MapPin size={12} /> Find coordinates on Google Maps (right-click → copy coords)</p>
              </div>

              <div className="form-section settings-checks">
                <h3>Status</h3>
                <label className="checkbox-group">
                  <div className="check-box">
                    <input type="checkbox" name="ihmRecommended" checked={formData.ihmRecommended} onChange={handleInputChange} />
                    <div className="custom-check"></div>
                  </div>
                  <div className="check-text">
                    <span className="label"><Star size={14} /> IHM Recommended</span>
                    <span className="hint">Featured on homepage and top picks</span>
                  </div>
                </label>
                <label className="checkbox-group">
                  <div className="check-box">
                    <input type="checkbox" name="verified" checked={formData.verified} onChange={handleInputChange} />
                    <div className="custom-check"></div>
                  </div>
                  <div className="check-text">
                    <span className="label"><ShieldCheck size={14} /> Verified Business</span>
                    <span className="hint">Verified authentic local experience</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/hotels')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader size={18} className="spinner" /> : <Save size={18} />}
              {isEditMode ? 'Update Hotel' : 'Save Hotel'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HotelForm;
