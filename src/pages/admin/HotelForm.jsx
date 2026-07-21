import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader, MapPin, Star, ShieldCheck, Link as LinkIcon, FileSpreadsheet, ImagePlus, Plus, Trash2, UtensilsCrossed, Crown, ChevronRight, ChevronLeft, Check, Store, Info, ClipboardList, SlidersHorizontal } from 'lucide-react';
import { hotelsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';

const ESTABLISHMENT_TYPES = ['Restaurant', 'Hotel', 'Cafe', 'Dhaba', 'Fine Dining', 'Street Food', 'Bakery', 'Food Court'];

// Shared field styles — kept in one place so every input looks the same and the
// JSX below stays readable.
const inputCls = 'w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-[1rem] transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20';
const smallInputCls = 'w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-[0.9rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20';
const labelCls = 'text-[0.9rem] text-gray-300 font-medium';
const cardCls = 'bg-white/5 data-[theme=light]:bg-black/5 border border-white/5 data-[theme=light]:border-black/10 rounded-2xl p-6 mb-6';
const titleCls = 'font-semibold text-[1.15rem] text-gray-100 data-[theme=light]:text-gray-900 mb-1 flex items-center gap-2';
const hintCls = 'text-[0.85rem] text-gray-500 mb-5';

const STEPS = [
  { key: 'basics', label: 'The Basics', icon: Store, blurb: 'Name, type and where it is' },
  { key: 'media', label: 'Photos & Map', icon: ImagePlus, blurb: 'Add pictures and pin the location' },
  { key: 'details', label: 'Details', icon: Info, blurb: 'Describe it and list amenities' },
  { key: 'menu', label: 'Menu & Extras', icon: UtensilsCrossed, blurb: 'Optional menu and quality notes' },
];

const HotelForm = ({ ownerMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const backPath = ownerMode ? '/partner/dashboard' : '/admin/hotels';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [photoMode, setPhotoMode] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [menuFile, setMenuFile] = useState(null);
  const [menuFileName, setMenuFileName] = useState('');
  const [showCoords, setShowCoords] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
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

  const [existingCuisines, setExistingCuisines] = useState([]);
  // Unified photo list: gallery[0] is the cover, the rest are carousel photos.
  // Existing images are URL strings; newly added ones are File objects.
  const [gallery, setGallery] = useState([]);
  // Hand-edited menu rows; an uploaded spreadsheet still takes precedence server-side.
  const [menuItems, setMenuItems] = useState([]);

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
        // Merge the cover image and gallery into one list; cover sits at index 0.
        const cover = typeof data.image === 'string' && data.image ? [data.image] : [];
        const extras = Array.isArray(data.gallery) ? data.gallery : [];
        setGallery([...cover, ...extras]);
        setMenuItems(Array.isArray(data.menuItems) ? data.menuItems : []);
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load hotel data');
      navigate(backPath);
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

  const [mapLink, setMapLink] = useState('');
  const [mapLinkError, setMapLinkError] = useState('');

  // Pull [lng, lat] out of a pasted Google Maps link (or a raw "lat,lng").
  const parseLatLngFromMapInput = (input) => {
    if (!input) return null;
    const s = input.trim();
    const inRange = (lat, lng) =>
      Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

    // Prefer the !3d<lat>!4d<lng> pin — it's the place, not the map center.
    const pin = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (pin) {
      const lat = parseFloat(pin[1]), lng = parseFloat(pin[2]);
      if (inRange(lat, lng)) return [lng, lat];
    }
    // @lat,lng (map center)
    const at = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (at) {
      const lat = parseFloat(at[1]), lng = parseFloat(at[2]);
      if (inRange(lat, lng)) return [lng, lat];
    }
    // q=/ll= params, or a raw "lat,lng" paste
    const q = s.match(/(?:[?&](?:q|ll|query)=)?(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (q) {
      const lat = parseFloat(q[1]), lng = parseFloat(q[2]);
      if (inRange(lat, lng)) return [lng, lat];
    }
    return null;
  };

  const applyMapLink = (value) => {
    setMapLink(value);
    if (!value.trim()) { setMapLinkError(''); return; }
    const coords = parseLatLngFromMapInput(value);
    if (coords) {
      setFormData(prev => ({ ...prev, location: { ...prev.location, type: 'Point', coordinates: coords } }));
      setMapLinkError('');
    } else {
      setMapLinkError('Couldn’t read coordinates from that link. Short links (maps.app.goo.gl) won’t work — open it, then copy the full URL or paste "lat, lng".');
    }
  };

  // Has the location actually been set (vs. the default city-centre fallback)?
  const locationIsSet = !!mapLink.trim() ||
    formData.location.coordinates[0] !== 75.3433 ||
    formData.location.coordinates[1] !== 19.8762;

  // ── Photos (unified cover + gallery) ──
  // The first photo (gallery[0]) is the cover; everything else is the carousel.
  const addPhotoFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setGallery(prev => [...prev, ...files].slice(0, 12));
    e.target.value = ''; // allow re-selecting the same file
  };

  const addPhotoUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setGallery(prev => [...prev, url].slice(0, 12));
    setUrlInput('');
  };

  const removePhoto = (index) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  // Promote a photo to cover by moving it to index 0.
  const setCover = (index) => {
    setGallery(prev => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const photoPreviewUrl = (item) =>
    item instanceof File ? URL.createObjectURL(item) : item;

  // ── Menu items (manual) ──
  const addMenuItem = () => {
    setMenuItems(prev => [...prev, { name: '', category: '', price: 0, isVeg: true }]);
  };

  const updateMenuItem = (index, field, value) => {
    setMenuItems(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeMenuItem = (index) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  // ── Step navigation & validation ──
  // Each entry returns an error message (and the step to land on) when something
  // required is missing, so we can guide the user instead of silently failing.
  const stepError = (s) => {
    if (s === 0) {
      if (!formData.name.trim()) return 'Please enter the name';
      if (!formData.cuisine.trim()) return 'Please enter the cuisine type';
      if (!formData.area.trim()) return 'Please enter the area / locality';
    }
    if (s === 1 && gallery.length === 0) return 'Please add at least one photo (the first becomes the cover)';
    if (s === 2 && !formData.description.trim()) return 'Please add a short description';
    return null;
  };

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goNext = () => {
    const err = stepError(step);
    if (err) { showToast.error('Almost there', err); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    scrollUp();
  };

  const goBack = () => { setStep(s => Math.max(s - 1, 0)); scrollUp(); };

  // Step indicator only lets you jump back to a step you've already completed.
  const goToStep = (target) => {
    if (target < step) { setStep(target); scrollUp(); }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Re-check every step's requirements; jump to the first problem if any.
    for (let s = 0; s < STEPS.length; s++) {
      const err = stepError(s);
      if (err) { setStep(s); scrollUp(); showToast.error('Almost there', err); return; }
    }

    setLoading(true);

    try {
      // Build submission payload. gallery[0] is the cover image; the rest are the carousel.
      const payload = {
        ...formData,
        facilities: formData.facilities
          ? formData.facilities.split(',').map(f => f.trim()).filter(Boolean)
          : [],
        image: gallery[0],
        gallery: gallery.slice(1),
        // Drop blank rows; coerce price to a number for the schema.
        menuItems: menuItems
          .filter(m => m.name && m.name.trim())
          .map(m => ({ ...m, price: Number(m.price) || 0 })),
      };

      if (isEditMode) {
        await hotelsApi.update(id, payload, menuFile || undefined);
        showToast.success('Success', 'Hotel updated successfully');
      } else {
        await hotelsApi.create(payload, menuFile || undefined);
        showToast.success(
          ownerMode ? 'Submitted for review' : 'Success',
          ownerMode ? "Thanks! We'll review your listing and publish it once approved." : 'Hotel created successfully'
        );
      }
      navigate(backPath);
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

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="p-8 max-w-[920px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex flex-col gap-4 mb-6">
        <button className="flex items-center gap-2 bg-transparent border-none text-purple-500 cursor-pointer font-medium w-fit p-0 transition-all duration-200 hover:text-purple-400 hover:-translate-x-1" onClick={() => navigate(backPath)}>
          <ArrowLeft size={20} />
          <span>{ownerMode ? 'Back to Dashboard' : 'Back to Management'}</span>
        </button>
        <h1 className="text-[2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">
          {ownerMode
            ? (isEditMode ? 'Edit Your Restaurant' : 'Add Your Restaurant')
            : (isEditMode ? 'Edit Hotel / Restaurant' : 'Add New Hotel / Restaurant')}
        </h1>
        {ownerMode && !isEditMode && (
          <p className="text-[0.9rem] text-gray-500 -mt-2">Your listing goes live after a quick review by our team, usually within a day or two.</p>
        )}
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => goToStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2.5 ${i <= step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-200
                  ${active ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_0_4px_rgba(168,85,247,0.2)]'
                    : done ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-transparent border-white/15 text-gray-600'}`}>
                  {done ? <Check size={18} /> : <Icon size={18} />}
                </span>
                <span className="flex flex-col items-start text-left max-md:hidden">
                  <span className={`text-[0.7rem] uppercase tracking-wider ${active || done ? 'text-purple-400' : 'text-gray-600'}`}>Step {i + 1}</span>
                  <span className={`text-[0.88rem] font-semibold leading-tight ${active ? 'text-gray-100 data-[theme=light]:text-gray-900' : done ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</span>
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className={`flex-1 h-[2px] mx-3 rounded-full transition-all duration-300 ${done ? 'bg-purple-500' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>

      <motion.div
        className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-md:p-5 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="mb-6">
            <h2 className="text-[1.4rem] font-bold text-gray-100 data-[theme=light]:text-gray-900 m-0">{STEPS[step].label}</h2>
            <p className="text-[0.9rem] text-gray-500 mt-1">{STEPS[step].blurb}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* ─────────────── STEP 1 — Basics ─────────────── */}
              {step === 0 && (
                <div className={cardCls}>
                  <div className="flex flex-col gap-2 mb-5">
                    <label className={labelCls}>Restaurant / Hotel Name *</label>
                    <input className={inputCls} name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Tandoor Restaurant" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>What kind of place is it? *</label>
                      <select className={inputCls} name="establishmentType" value={formData.establishmentType} onChange={handleInputChange} required>
                        {ESTABLISHMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>Cuisine Type *</label>
                      <input className={inputCls} name="cuisine" value={formData.cuisine} onChange={handleInputChange} required placeholder="e.g. North Indian, Mughlai" list="cuisine-list" />
                      <datalist id="cuisine-list">
                        {existingCuisines.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-5">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>Area / Locality *</label>
                      <input className={inputCls} name="area" value={formData.area} onChange={handleInputChange} required placeholder="e.g. Nirala Bazar" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>How pricey is it? *</label>
                      <select className={inputCls} name="priceRange" value={formData.priceRange} onChange={handleInputChange} required>
                        <option value="₹">₹ (Budget)</option>
                        <option value="₹₹">₹₹ (Moderate)</option>
                        <option value="₹₹₹">₹₹₹ (Premium)</option>
                        <option value="₹₹₹₹">₹₹₹₹ (Luxury)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelCls}>Food Type *</label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { value: 'veg', label: 'Pure Veg', emoji: '🟢', color: 'green' },
                        { value: 'non-veg', label: 'Non-Veg', emoji: '🔴', color: 'red' },
                        { value: 'both', label: 'Veg & Non-Veg', emoji: '🟡', color: 'purple' },
                      ].map(opt => (
                        <label key={opt.value}
                          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl border cursor-pointer transition-all duration-200 text-[0.9rem] font-medium
                            ${formData.foodType === opt.value
                              ? opt.color === 'green' ? 'bg-green-500/15 border-green-500 text-green-400'
                                : opt.color === 'red' ? 'bg-red-500/15 border-red-500 text-red-400'
                                : 'bg-purple-500/15 border-purple-500 text-purple-400'
                              : 'bg-transparent border-white/10 text-gray-500 hover:bg-white/5'}`}>
                          <input type="radio" name="foodType" value={opt.value} checked={formData.foodType === opt.value} onChange={handleInputChange} className="hidden" />
                          {opt.emoji} {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────── STEP 2 — Photos & Map ─────────────── */}
              {step === 1 && (
                <>
                  <div className={cardCls}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={titleCls}><ImagePlus size={20} className="text-purple-500" /> Photos *</h3>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setPhotoMode('upload')}
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-all duration-200 font-medium text-[0.78rem] cursor-pointer ${photoMode === 'upload' ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'bg-transparent border-white/10 text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                          <Upload size={13} /> Upload
                        </button>
                        <button type="button" onClick={() => setPhotoMode('url')}
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-all duration-200 font-medium text-[0.78rem] cursor-pointer ${photoMode === 'url' ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'bg-transparent border-white/10 text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                          <LinkIcon size={13} /> Paste link
                        </button>
                      </div>
                    </div>
                    <p className={hintCls}>
                      Add up to 12 photos. The <strong className="text-purple-400">first photo is the cover</strong> — tap any other to make it the cover.
                    </p>

                    {photoMode === 'url' && (
                      <div className="flex gap-2 mb-4">
                        <input className={inputCls + ' flex-1'} type="url" placeholder="https://example.com/image.jpg" value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhotoUrl(); } }} />
                        <button type="button" onClick={addPhotoUrl}
                          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-purple-500 text-white font-medium text-[0.85rem] cursor-pointer transition-all hover:bg-purple-600 disabled:opacity-50"
                          disabled={!urlInput.trim() || gallery.length >= 12}>
                          <Plus size={15} /> Add
                        </button>
                      </div>
                    )}

                    {gallery.length > 0 ? (
                      <>
                        <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative mb-3 border border-white/10">
                          <img src={photoPreviewUrl(gallery[0])} alt="Cover" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400/90 text-black text-[0.7rem] font-bold py-1 px-2.5 rounded-full">
                            <Crown size={13} /> Cover
                          </span>
                          {gallery[0] instanceof File && (
                            <span className="absolute bottom-2 left-2 bg-purple-500/90 text-white text-[0.65rem] font-semibold py-0.5 px-2 rounded">NEW</span>
                          )}
                          <button type="button" onClick={() => removePhoto(0)}
                            className="absolute top-2 right-2 bg-black/70 border-none text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-500">
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 max-md:grid-cols-3">
                          {gallery.slice(1).map((item, i) => {
                            const realIndex = i + 1;
                            return (
                              <div key={realIndex} onClick={() => setCover(realIndex)}
                                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
                                <img src={photoPreviewUrl(item)} alt={`Photo ${realIndex + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-white">
                                  <Crown size={16} className="text-amber-400" />
                                  <span className="text-[0.6rem] font-medium text-center leading-tight px-1">Set as cover</span>
                                </div>
                                <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(realIndex); }}
                                  className="absolute top-1 right-1 bg-black/70 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-red-500 opacity-0 group-hover:opacity-100 z-10">
                                  <X size={12} />
                                </button>
                                {item instanceof File && (
                                  <span className="absolute bottom-1 left-1 bg-purple-500/90 text-white text-[0.55rem] font-semibold py-0.5 px-1 rounded z-10">NEW</span>
                                )}
                              </div>
                            );
                          })}
                          {gallery.length < 12 && photoMode === 'upload' && (
                            <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-500 transition-all hover:bg-purple-500/5 hover:border-purple-500 hover:text-purple-500 data-[theme=light]:border-black/20">
                              <Plus size={20} />
                              <span className="text-[0.65rem]">Add</span>
                              <input type="file" hidden multiple accept="image/*" onChange={addPhotoFiles} />
                            </label>
                          )}
                        </div>
                      </>
                    ) : (
                      photoMode === 'upload' && (
                        <label className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer text-gray-500 transition-all duration-200 hover:bg-purple-500/5 hover:border-purple-500 hover:text-purple-500 data-[theme=light]:border-black/20">
                          <Upload size={32} />
                          <span>Click to upload photos</span>
                          <span className="text-[0.78rem] text-gray-600">First one becomes the cover</span>
                          <input type="file" hidden multiple onChange={addPhotoFiles} accept="image/*" />
                        </label>
                      )
                    )}
                  </div>

                  <div className={cardCls}>
                    <h3 className={titleCls}><MapPin size={20} className="text-purple-500" /> Where is it on the map?</h3>
                    <p className={hintCls}>Open the place in Google Maps, copy the link from your browser's address bar, and paste it here. We'll figure out the exact spot for you.</p>

                    <div className="flex flex-col gap-2 mb-2">
                      <input className={inputCls} type="text" placeholder="Paste Google Maps link here..." value={mapLink} onChange={(e) => applyMapLink(e.target.value)} />
                      {mapLinkError
                        ? <p className="text-[0.8rem] text-red-400 mt-1">{mapLinkError}</p>
                        : locationIsSet
                          ? <p className="text-[0.82rem] text-green-400 mt-1 flex items-center gap-1.5"><Check size={14} /> Location pinned — you're all set.</p>
                          : <p className="text-[0.8rem] text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12} /> Tip: you can also paste plain coordinates like "19.87, 75.34".</p>}
                    </div>

                    <button type="button" onClick={() => setShowCoords(c => !c)}
                      className="text-[0.8rem] text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1 mt-2">
                      <SlidersHorizontal size={13} /> {showCoords ? 'Hide' : 'Enter coordinates manually'}
                    </button>

                    {showCoords && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex flex-col gap-2">
                          <label className={labelCls}>Longitude</label>
                          <input className={inputCls} type="number" step="any" value={formData.location.coordinates[0]} onChange={(e) => handleCoordinateChange(0, e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className={labelCls}>Latitude</label>
                          <input className={inputCls} type="number" step="any" value={formData.location.coordinates[1]} onChange={(e) => handleCoordinateChange(1, e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ─────────────── STEP 3 — Details ─────────────── */}
              {step === 2 && (
                <>
                  <div className={cardCls}>
                    <h3 className={titleCls}>Description *</h3>
                    <p className={hintCls}>A couple of sentences visitors will read. What makes this place worth visiting?</p>
                    <textarea className={inputCls + ' resize-y min-h-[140px]'} name="description" value={formData.description} onChange={handleInputChange}
                      placeholder="Tell visitors something about this place..." rows="5" required />
                  </div>

                  <div className={cardCls}>
                    <h3 className={titleCls}>Address & Rating</h3>
                    <div className="flex flex-col gap-2 mb-5">
                      <label className={labelCls}>Full Address</label>
                      <textarea className={inputCls + ' resize-y'} name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete address..." rows="2" />
                    </div>
                    <div className="flex flex-col gap-2 max-w-[220px]">
                      <label className={labelCls}>Overall Rating (1–5)</label>
                      <input className={inputCls} type="number" step="0.1" min="1" max="5" name="rating" value={formData.rating} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className={cardCls}>
                    <h3 className={titleCls}>Amenities</h3>
                    <p className={hintCls}>Tick everything this place offers.</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {[
                        { key: 'ac', label: '❄️ Air Conditioning' },
                        { key: 'disabilityAccess', label: '♿ Disability Access' },
                        { key: 'washroom', label: '🚻 Washroom' },
                        { key: 'parking', label: '🅿️ Parking' },
                        { key: 'parcel', label: '📦 Parcel / Takeaway' },
                      ].map(f => (
                        <label key={f.key} className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border cursor-pointer text-[0.85rem] font-medium transition-all
                          ${formData.extraFacilities[f.key] ? 'bg-purple-500/15 border-purple-500 text-purple-400' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}>
                          <input type="checkbox" className="hidden" checked={formData.extraFacilities[f.key]}
                            onChange={e => handleNestedChange('extraFacilities', f.key, e.target.checked)} />
                          {f.label}
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                      <div className="flex flex-col gap-2">
                        <label className={labelCls}>Anything else? <span className="text-gray-600 font-normal">(optional)</span></label>
                        <input className={inputCls} name="facilities" value={formData.facilities} onChange={handleInputChange} placeholder="WiFi, Rooftop, Live music..." />
                        <span className="text-[0.75rem] text-gray-600">Separate with commas</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={labelCls}>Seating Capacity <span className="text-gray-600 font-normal">(optional)</span></label>
                        <input className={inputCls} type="number" min="0" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleInputChange} placeholder="e.g. 50" />
                      </div>
                    </div>
                  </div>

                  {!ownerMode && (
                    <div className={cardCls + ' flex flex-col gap-4 mb-0'}>
                      <h3 className={titleCls}>Visibility</h3>
                      <label className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-black/20 cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 group data-[theme=light]:bg-white data-[theme=light]:border-black/10">
                        <input type="checkbox" className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-600" name="ihmRecommended" checked={formData.ihmRecommended} onChange={handleInputChange} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-100 text-[0.95rem] flex items-center gap-1.5 data-[theme=light]:text-gray-900 group-hover:text-purple-500"><Star size={14} /> IHM Recommended</span>
                          <span className="text-[0.8rem] text-gray-500">Featured on homepage and top picks</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-black/20 cursor-pointer transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 group data-[theme=light]:bg-white data-[theme=light]:border-black/10">
                        <input type="checkbox" className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-600" name="verified" checked={formData.verified} onChange={handleInputChange} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-100 text-[0.95rem] flex items-center gap-1.5 data-[theme=light]:text-gray-900 group-hover:text-purple-500"><ShieldCheck size={14} /> Verified Business</span>
                          <span className="text-[0.8rem] text-gray-500">Verified authentic local experience</span>
                        </div>
                      </label>
                    </div>
                  )}
                </>
              )}

              {/* ─────────────── STEP 4 — Menu & Extras ─────────────── */}
              {step === 3 && (
                <>
                  <div className={cardCls}>
                    <h3 className={titleCls}><UtensilsCrossed size={20} className="text-purple-500" /> Menu <span className="text-[0.8rem] font-normal text-gray-500">(optional)</span></h3>
                    <p className={hintCls}>Either upload a spreadsheet or add a few items by hand. You can skip this entirely.</p>

                    <label className={`flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer transition-all duration-200 mb-4
                      ${menuFileName ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-black/20 text-gray-400 hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-purple-400'}`}>
                      <FileSpreadsheet size={20} />
                      <span className="text-[0.88rem] font-medium truncate flex-1">{menuFileName || 'Upload menu spreadsheet (.xlsx / .csv)'}</span>
                      {menuFileName && (
                        <button type="button" onClick={e => { e.preventDefault(); setMenuFile(null); setMenuFileName(''); }} className="text-gray-500 hover:text-red-400 transition-colors">
                          <X size={16} />
                        </button>
                      )}
                      <input type="file" hidden accept=".xlsx,.xls,.csv"
                        onChange={e => { const f = e.target.files[0]; if (f) { setMenuFile(f); setMenuFileName(f.name); } }} />
                    </label>
                    {menuFileName
                      ? <p className="text-[0.78rem] text-green-400 -mt-2 mb-4 flex items-center gap-1">✓ {menuFileName} ready — it replaces the manual list below on save.</p>
                      : <p className="text-[0.78rem] text-gray-600 -mt-2 mb-4">Columns: name, category, price, isVeg</p>}

                    <div className="flex flex-col gap-2">
                      {menuItems.map((item, i) => (
                        <div key={i} className="grid grid-cols-[1.4fr_1fr_0.8fr_auto_auto] gap-2 items-center max-md:grid-cols-2">
                          <input type="text" value={item.name} onChange={e => updateMenuItem(i, 'name', e.target.value)} placeholder="Item name" className={smallInputCls} />
                          <input type="text" value={item.category} onChange={e => updateMenuItem(i, 'category', e.target.value)} placeholder="Category" className={smallInputCls} />
                          <input type="number" min="0" value={item.price} onChange={e => updateMenuItem(i, 'price', e.target.value)} placeholder="₹" className={smallInputCls} />
                          <button type="button" onClick={() => updateMenuItem(i, 'isVeg', !item.isVeg)} title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all shrink-0 ${item.isVeg ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                            {item.isVeg ? '🟢' : '🔴'}
                          </button>
                          <button type="button" onClick={() => removeMenuItem(i)}
                            className="w-9 h-9 rounded-lg border border-white/10 text-gray-500 flex items-center justify-center transition-all hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 shrink-0">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addMenuItem}
                      className="mt-3 flex items-center gap-2 py-2 px-4 rounded-lg border border-dashed border-white/15 text-gray-400 text-[0.85rem] font-medium cursor-pointer transition-all hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5">
                      <Plus size={16} /> Add menu item
                    </button>
                  </div>

                  {/* Quality assessment — collapsed by default so everyday users can ignore it. */}
                  <div className={cardCls + ' mb-0'}>
                    <button type="button" onClick={() => setShowAssessment(a => !a)}
                      className="w-full flex items-center justify-between cursor-pointer">
                      <div className="text-left">
                        <h3 className={titleCls + ' mb-0'}><ClipboardList size={20} className="text-purple-500" /> Quality Assessment <span className="text-[0.8rem] font-normal text-gray-500">(optional)</span></h3>
                        <p className="text-[0.82rem] text-gray-500 mt-1">Detailed IHM scoring — for reviewers. Safe to skip.</p>
                      </div>
                      <ChevronRight size={20} className={`text-gray-500 transition-transform shrink-0 ${showAssessment ? 'rotate-90' : ''}`} />
                    </button>

                    {showAssessment && (
                      <div className="mt-6 flex flex-col gap-6">
                        {/* Food & Quality */}
                        <div>
                          <h4 className="text-[0.95rem] font-semibold text-gray-300 mb-3">Food & Quality</h4>
                          <div className="grid grid-cols-3 gap-3 mb-3 max-md:grid-cols-2">
                            {[
                              { key: 'quality', label: 'Food Quality' },
                              { key: 'hygiene', label: 'Food Hygiene' },
                              { key: 'kitchenHygiene', label: 'Kitchen Hygiene' },
                              { key: 'menuVariety', label: 'Menu Variety' },
                              { key: 'valueForMoney', label: 'Value for Money' },
                            ].map(f => (
                              <div key={f.key} className="flex flex-col gap-1">
                                <label className="text-[0.78rem] text-gray-400">{f.label}</label>
                                <select value={formData.food[f.key]} onChange={e => handleNestedChange('food', f.key, Number(e.target.value))} className={smallInputCls}>
                                  <option value={0}>—</option>
                                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.78rem] text-gray-400">Signature Dishes</label>
                              <input type="text" value={formData.food.signatureDishes} onChange={e => handleNestedChange('food', 'signatureDishes', e.target.value)} placeholder="e.g. Biryani, Kebab" className={smallInputCls} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.78rem] text-gray-400">Specialty Dishes</label>
                              <input type="text" value={formData.food.specialtyDishes} onChange={e => handleNestedChange('food', 'specialtyDishes', e.target.value)} placeholder="e.g. Naan, Haleem" className={smallInputCls} />
                            </div>
                          </div>
                        </div>

                        {/* Staff & Service */}
                        <div>
                          <h4 className="text-[0.95rem] font-semibold text-gray-300 mb-3">Staff & Service</h4>
                          <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                            {[
                              { key: 'friendliness', label: 'Friendliness' },
                              { key: 'appearance', label: 'Appearance' },
                            ].map(f => (
                              <div key={f.key} className="flex flex-col gap-1">
                                <label className="text-[0.78rem] text-gray-400">{f.label}</label>
                                <select value={formData.staff[f.key]} onChange={e => handleNestedChange('staff', f.key, Number(e.target.value))} className={smallInputCls}>
                                  <option value={0}>—</option>
                                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                </select>
                              </div>
                            ))}
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.78rem] text-gray-400">Service Type</label>
                              <select value={formData.staff.serviceType} onChange={e => handleNestedChange('staff', 'serviceType', e.target.value)} className={smallInputCls}>
                                <option value="dine-in">Dine-in</option>
                                <option value="takeaway">Takeaway</option>
                                <option value="both">Both</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Environment, Pricing & Extras */}
                        <div>
                          <h4 className="text-[0.95rem] font-semibold text-gray-300 mb-3">Environment, Pricing & Extras</h4>
                          <div className="grid grid-cols-2 gap-3 mb-3 max-md:grid-cols-1">
                            {[
                              { key: 'outsideCleanliness', label: 'Outside Cleanliness' },
                              { key: 'ambience', label: 'Overall Ambience' },
                            ].map(f => (
                              <div key={f.key} className="flex flex-col gap-1">
                                <label className="text-[0.78rem] text-gray-400">{f.label}</label>
                                <select value={formData.environment[f.key]} onChange={e => handleNestedChange('environment', f.key, Number(e.target.value))} className={smallInputCls}>
                                  <option value={0}>—</option>
                                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.78rem] text-gray-400">Unique Features</label>
                              <input type="text" value={formData.environment.uniqueFeatures} onChange={e => handleNestedChange('environment', 'uniqueFeatures', e.target.value)} placeholder="e.g. Rooftop, Live music" className={smallInputCls} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.78rem] text-gray-400">Avg Price / Person (₹)</label>
                              <input type="number" min="0" name="avgPricePerPerson" value={formData.avgPricePerPerson} onChange={handleInputChange} placeholder="e.g. 350" className={smallInputCls} />
                            </div>
                            <div className="flex flex-col gap-1 col-span-2 max-md:col-span-1">
                              <label className="text-[0.78rem] text-gray-400">Sustainability Practices</label>
                              <input type="text" name="sustainabilityPractices" value={formData.sustainabilityPractices} onChange={handleInputChange} placeholder="e.g. Eco-friendly packaging" className={smallInputCls} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between gap-4 pt-6 mt-2 border-t border-white/10 data-[theme=light]:border-black/10">
            {step === 0 ? (
              <button type="button" onClick={() => navigate(backPath)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white data-[theme=light]:border-black/20 data-[theme=light]:text-gray-600 data-[theme=light]:hover:text-gray-900 data-[theme=light]:hover:bg-black/5">
                Cancel
              </button>
            ) : (
              <button type="button" onClick={goBack}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white data-[theme=light]:border-black/20 data-[theme=light]:text-gray-600 data-[theme=light]:hover:text-gray-900 data-[theme=light]:hover:bg-black/5">
                <ChevronLeft size={18} /> Back
              </button>
            )}

            <span className="text-[0.82rem] text-gray-600 max-md:hidden">Step {step + 1} of {STEPS.length}</span>

            {isLastStep ? (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-purple-500 text-white border-none hover:bg-purple-600 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(168,85,247,0.3)] disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                {isEditMode ? 'Update Hotel' : 'Save Hotel'}
              </button>
            ) : (
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-purple-500 text-white border-none hover:bg-purple-600 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(168,85,247,0.3)]">
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HotelForm;
