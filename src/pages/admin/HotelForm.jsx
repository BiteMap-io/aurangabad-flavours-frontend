import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, MapPin, Star, ShieldCheck, Link as LinkIcon, FileSpreadsheet, Leaf, Drumstick } from 'lucide-react';
import { hotelsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';

const ESTABLISHMENT_TYPES = ['Restaurant', 'Hotel', 'Cafe', 'Dhaba', 'Fine Dining', 'Street Food', 'Bakery', 'Food Court'];

const HotelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageMode, setImageMode] = useState('url');
  const [menuFile, setMenuFile] = useState(null);
  const [menuFileName, setMenuFileName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    establishmentType: 'Restaurant',
    cuisine: '',
    area: '',
    priceRange: '₹₹',
    rating: 4.5,
    ihmRecommended: false,
    verified: false,
    image: '',
    address: '',
    description: '',
    facilities: '',
    foodType: 'both',
    seatingCapacity: '',
    extraFacilities: { ac: false, disabilityAccess: false, washroom: false, parking: false, parcel: false },
    food: { quality: 0, hygiene: 0, kitchenHygiene: 0, menuVariety: 0, valueForMoney: 0, signatureDishes: '', specialtyDishes: '' },
    staff: { friendliness: 0, appearance: 0, serviceType: 'both' },
    environment: { outsideCleanliness: 0, ambience: 0, uniqueFeatures: '' },
    avgPricePerPerson: '',
    sustainabilityPractices: '',
    location: { type: 'Point', coordinates: [75.3433, 19.8762] }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingCuisines, setExistingCuisines] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      loadHotelData();
    }
    loadCuisines();
  }, [id]);

  const loadCuisines = async () => {
    try {
      const response = await hotelsApi.getAll();
      const data = response.data || response;
      if (Array.isArray(data)) {
        const cuisineSet = new Set();
        data.forEach(h => {
          if (h.cuisine) {
            h.cuisine.split(',').forEach(c => cuisineSet.add(c.trim()));
          }
        });
        setExistingCuisines(Array.from(cuisineSet).sort());
      }
    } catch (error) {
      console.error('Failed to load existing cuisines:', error);
    }
  };

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
          seatingCapacity: data.seatingCapacity || '',
          avgPricePerPerson: data.avgPricePerPerson || '',
          sustainabilityPractices: data.sustainabilityPractices || '',
          extraFacilities: data.extraFacilities || { ac: false, disabilityAccess: false, washroom: false, parking: false, parcel: false },
          food: data.food || { quality: 0, hygiene: 0, kitchenHygiene: 0, menuVariety: 0, valueForMoney: 0, signatureDishes: '', specialtyDishes: '' },
          staff: data.staff || { friendliness: 0, appearance: 0, serviceType: 'both' },
          environment: data.environment || { outsideCleanliness: 0, ambience: 0, uniqueFeatures: '' },
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

  // Handle nested object fields: e.g. name="food.quality"
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
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
        image: imageMode === 'file' ? imagePreview : formData.image,
      };

      if (isEditMode) {
        await hotelsApi.update(id, payload, menuFile || undefined);
        showToast.success('Success', 'Hotel updated successfully');
      } else {
        await hotelsApi.create(payload, menuFile || undefined);
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
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Loader size={48} className="animate-spin mb-4 text-purple-500" />
        <p className="m-0">Loading hotel information...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex flex-col gap-4 mb-8">
        <button className="flex items-center gap-2 bg-transparent border-none text-purple-500 cursor-pointer font-medium w-fit p-0 transition-all duration-200 hover:text-purple-400 hover:-translate-x-1" onClick={() => navigate('/admin/hotels')}>
          <ArrowLeft size={20} />
          <span>Back to Management</span>
        </button>
        <h1 className="text-[2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">{isEditMode ? 'Edit Hotel / Restaurant' : 'Add New Hotel / Restaurant'}</h1>
      </div>

      <motion.div
        className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[1.5fr_1fr] gap-10 max-[1024px]:grid-cols-1">
            {/* Left Column */}
            <div className="flex flex-col">
              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Basic Information</h3>

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Restaurant / Hotel Name *</label>
                  <input
                    className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Tandoor Restaurant"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Establishment Type *</label>
                    <select className="bg-black/30 w-full border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="establishmentType" value={formData.establishmentType} onChange={handleInputChange} required>
                      {ESTABLISHMENT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Cuisine Type *</label>
                    <input
                      className="bg-black/30 w-full border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. North Indian, Mughlai"
                      list="cuisine-list"
                    />
                    <datalist id="cuisine-list">
                      {existingCuisines.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Area / Locality *</label>
                    <input
                      className="bg-black/30 w-full border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Nirala Bazar"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Price Range *</label>
                    <select className="bg-black/30 w-full border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" name="priceRange" value={formData.priceRange} onChange={handleInputChange} required>
                      <option value="₹">₹ (Budget)</option>
                      <option value="₹₹">₹₹ (Moderate)</option>
                      <option value="₹₹₹">₹₹₹ (Premium)</option>
                      <option value="₹₹₹₹">₹₹₹₹ (Luxury)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Rating (1–5)</label>
                    <input
                      className="bg-black/30 w-full border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      type="number" step="0.1" min="1" max="5"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Facilities (comma-separated)</label>
                    <input
                      className="bg-black/30 w-full border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      name="facilities"
                      value={formData.facilities}
                      onChange={handleInputChange}
                      placeholder="WiFi, Parking, AC..."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Full Address</label>
                  <textarea
                    className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20 resize-y"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address..."
                    rows="2"
                  />
                </div>

                {/* Food Type */}
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[0.9rem] text-gray-400 font-medium">Food Type *</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'veg', label: 'Pure Veg', color: 'green' },
                      { value: 'non-veg', label: 'Non-Veg', color: 'red' },
                      { value: 'both', label: 'Veg & Non-Veg', color: 'purple' },
                    ].map(opt => (
                      <label key={opt.value}
                        className={`flex items-center gap-2 py-2 px-4 rounded-xl border cursor-pointer transition-all duration-200 text-[0.88rem] font-medium
                          ${formData.foodType === opt.value
                            ? opt.color === 'green' ? 'bg-green-500/15 border-green-500 text-green-400'
                              : opt.color === 'red' ? 'bg-red-500/15 border-red-500 text-red-400'
                              : 'bg-purple-500/15 border-purple-500 text-purple-400'
                            : 'bg-transparent border-white/10 text-gray-500 hover:bg-white/5'}`}>
                        <input type="radio" name="foodType" value={opt.value}
                          checked={formData.foodType === opt.value}
                          onChange={handleInputChange} className="hidden" />
                        {opt.value === 'veg' ? '🟢' : opt.value === 'non-veg' ? '🔴' : '🟡'} {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Description *</h3>
                <div className="flex flex-col gap-2 mb-5">
                  <textarea
                    className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y min-h-[150px] data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
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
            <div className="flex flex-col">
              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Cover Image *</h3>
                <div className="flex gap-2 mb-0">
                  <button type="button" className={`flex items-center gap-2 py-2 px-4 rounded-lg border border-transparent transition-all duration-200 font-medium text-[0.82rem] cursor-pointer ${imageMode === 'url' ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'bg-transparent border-white/10 text-gray-500 hover:bg-white/5 hover:text-gray-300'}`} onClick={() => setImageMode('url')}>
                    <LinkIcon size={14} /> Image URL
                  </button>
                  <button type="button" className={`flex items-center gap-2 py-2 px-4 rounded-lg border border-transparent transition-all duration-200 font-medium text-[0.82rem] cursor-pointer ${imageMode === 'file' ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'bg-transparent border-white/10 text-gray-500 hover:bg-white/5 hover:text-gray-300'}`} onClick={() => setImageMode('file')}>
                    <Upload size={14} /> Upload File
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <div className="flex flex-col gap-2 mt-3 mb-5">
                    <input
                      className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleImageUrlChange}
                    />
                  </div>
                ) : null}

                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative mt-3">
                  {imagePreview ? (
                    <div className="w-full h-full relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                      <button type="button" className="absolute top-2 right-2 bg-black/70 border-none text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-500" onClick={clearImage}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : imageMode === 'file' ? (
                    <label className="w-full h-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer text-gray-500 transition-all duration-200 hover:bg-purple-500/5 hover:border-purple-500 hover:text-purple-500 data-[theme=light]:border-black/20">
                      <Upload size={32} />
                      <span>Click to upload image</span>
                      <input type="file" hidden onChange={handleImageFileChange} accept="image/*" />
                    </label>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-white/10/70 flex flex-col items-center justify-center gap-3 text-gray-700 bg-transparent text-center p-4 text-[0.85rem] data-[theme=light]:border-black/20">
                      <LinkIcon size={28} />
                      <span>Paste an image URL above to preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-6 flex items-center gap-2">Location Coordinates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Longitude</label>
                    <input
                      className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      type="number" step="any"
                      value={formData.location.coordinates[0]}
                      onChange={(e) => handleCoordinateChange(0, e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.9rem] text-gray-400 font-medium">Latitude</label>
                    <input
                      className="bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
                      type="number" step="any"
                      value={formData.location.coordinates[1]}
                      onChange={(e) => handleCoordinateChange(1, e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-[0.8rem] text-gray-500 mt-2 flex items-center gap-1"><MapPin size={12} /> Find coordinates on Google Maps (right-click → copy coords)</p>
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-4 flex items-center gap-2">
                  <FileSpreadsheet size={18} /> Menu Upload (Excel / CSV)
                </h3>
                <p className="text-[0.8rem] text-gray-500 mb-4">
                  Upload an Excel or CSV file with columns: <strong className="text-gray-400">name, category, price, isVeg</strong>
                </p>
                <label className={`flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${menuFileName ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-black/20 text-gray-400 hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-purple-400'}`}>
                  <FileSpreadsheet size={20} />
                  <span className="text-[0.88rem] font-medium truncate flex-1">
                    {menuFileName || 'Click to upload .xlsx / .csv'}
                  </span>
                  {menuFileName && (
                    <button type="button" onClick={e => { e.preventDefault(); setMenuFile(null); setMenuFileName(''); }}
                      className="text-gray-500 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                  <input type="file" hidden accept=".xlsx,.xls,.csv"
                    onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setMenuFile(f); setMenuFileName(f.name); }
                    }} />
                </label>
                {menuFileName && (
                  <p className="text-[0.78rem] text-green-400 mt-2 flex items-center gap-1">
                    ✓ {menuFileName} ready to upload
                  </p>
                )}
              </div>

              <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6 flex flex-col gap-6">
                <h3 className="font-semibold text-[1.1rem] text-purple-500 flex items-center gap-2 mb-0">Status</h3>                <label className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-black/20 cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 group data-[theme=light]:bg-white data-[theme=light]:border-black/10">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600" name="ihmRecommended" checked={formData.ihmRecommended} onChange={handleInputChange} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-100 text-[0.95rem] flex items-center gap-1.5 data-[theme=light]:text-gray-900 group-hover:text-purple-500"><Star size={14} /> IHM Recommended</span>
                    <span className="text-[0.8rem] text-gray-500">Featured on homepage and top picks</span>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-black/20 cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 group data-[theme=light]:bg-white data-[theme=light]:border-black/10">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600" name="verified" checked={formData.verified} onChange={handleInputChange} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-100 text-[0.95rem] flex items-center gap-1.5 data-[theme=light]:text-gray-900 group-hover:text-purple-500"><ShieldCheck size={14} /> Verified Business</span>
                    <span className="text-[0.8rem] text-gray-500">Verified authentic local experience</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── Extended sections (full-width below two columns) ── */}
          <div className="col-span-full grid grid-cols-2 gap-6 max-[1024px]:grid-cols-1">

            {/* Capacity & Extra Facilities */}
            <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-4">Capacity & Extra Facilities</h3>
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-[0.9rem] text-gray-400 font-medium">Seating Capacity</label>
                <input type="number" min="0" name="seatingCapacity" value={formData.seatingCapacity}
                  onChange={handleInputChange} placeholder="e.g. 50"
                  className="bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-white text-[0.9rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" />
              </div>
              <label className="text-[0.9rem] text-gray-400 font-medium mb-2 block">Facilities</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'ac', label: '❄️ Air Conditioning' },
                  { key: 'disabilityAccess', label: '♿ Disability Access' },
                  { key: 'washroom', label: '🚻 Washroom' },
                  { key: 'parking', label: '🅿️ Parking' },
                  { key: 'parcel', label: '📦 Parcel / Takeaway' },
                ].map(f => (
                  <label key={f.key} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg border cursor-pointer text-[0.8rem] font-medium transition-all
                    ${formData.extraFacilities[f.key] ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                    <input type="checkbox" className="hidden"
                      checked={formData.extraFacilities[f.key]}
                      onChange={e => handleNestedChange('extraFacilities', f.key, e.target.checked)} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Food & Quality */}
            <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-4">Food & Quality</h3>
              <div className="grid grid-cols-2 gap-3 mb-3 max-md:grid-cols-1">
                {[
                  { key: 'quality', label: 'Food Quality' },
                  { key: 'hygiene', label: 'Food Hygiene' },
                  { key: 'kitchenHygiene', label: 'Kitchen Hygiene' },
                  { key: 'menuVariety', label: 'Menu Variety' },
                  { key: 'valueForMoney', label: 'Value for Money' },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-[0.78rem] text-gray-400">{f.label}</label>
                    <select value={formData.food[f.key]}
                      onChange={e => handleNestedChange('food', f.key, Number(e.target.value))}
                      className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20">
                      <option value={0}>—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.78rem] text-gray-400">Signature Dishes</label>
                  <input type="text" value={formData.food.signatureDishes}
                    onChange={e => handleNestedChange('food', 'signatureDishes', e.target.value)}
                    placeholder="e.g. Biryani, Kebab"
                    className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.78rem] text-gray-400">Specialty Dishes</label>
                  <input type="text" value={formData.food.specialtyDishes}
                    onChange={e => handleNestedChange('food', 'specialtyDishes', e.target.value)}
                    placeholder="e.g. Naan, Haleem"
                    className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" />
                </div>
              </div>
            </div>

            {/* Staff & Service */}
            <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-4">Staff & Service</h3>
              <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                {[
                  { key: 'friendliness', label: 'Friendliness' },
                  { key: 'appearance', label: 'Appearance' },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-[0.78rem] text-gray-400">{f.label}</label>
                    <select value={formData.staff[f.key]}
                      onChange={e => handleNestedChange('staff', f.key, Number(e.target.value))}
                      className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20">
                      <option value={0}>—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                    </select>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <label className="text-[0.78rem] text-gray-400">Service Type</label>
                  <select value={formData.staff.serviceType}
                    onChange={e => handleNestedChange('staff', 'serviceType', e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20">
                    <option value="dine-in">Dine-in</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Environment + Pricing + Extras */}
            <div className="bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[1.1rem] text-purple-500 mb-4">Environment, Pricing & Extras</h3>
              <div className="grid grid-cols-2 gap-3 mb-3 max-md:grid-cols-1">
                {[
                  { key: 'outsideCleanliness', label: 'Outside Cleanliness' },
                  { key: 'ambience', label: 'Overall Ambience' },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-[0.78rem] text-gray-400">{f.label}</label>
                    <select value={formData.environment[f.key]}
                      onChange={e => handleNestedChange('environment', f.key, Number(e.target.value))}
                      className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20">
                      <option value={0}>—</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.78rem] text-gray-400">Unique Features</label>
                  <input type="text" value={formData.environment.uniqueFeatures}
                    onChange={e => handleNestedChange('environment', 'uniqueFeatures', e.target.value)}
                    placeholder="e.g. Rooftop, Live music"
                    className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.78rem] text-gray-400">Avg Price / Person (₹)</label>
                  <input type="number" min="0" name="avgPricePerPerson" value={formData.avgPricePerPerson}
                    onChange={handleInputChange} placeholder="e.g. 350"
                    className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" />
                </div>
                <div className="flex flex-col gap-1 col-span-2 max-md:col-span-1">
                  <label className="text-[0.78rem] text-gray-400">Sustainability Practices</label>
                  <input type="text" name="sustainabilityPractices" value={formData.sustainabilityPractices}
                    onChange={handleInputChange} placeholder="e.g. Eco-friendly packaging"
                    className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-white text-[0.85rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-white/10 data-[theme=light]:border-black/10">
            <button type="button" className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white data-[theme=light]:border-black/20 data-[theme=light]:text-gray-600 data-[theme=light]:hover:text-gray-900 data-[theme=light]:hover:bg-black/5" onClick={() => navigate('/admin/hotels')}>Cancel</button>
            <button type="submit" className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-purple-500 text-white border-none hover:bg-purple-600 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(168,85,247,0.3)] disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditMode ? 'Update Hotel' : 'Save Hotel'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HotelForm;
