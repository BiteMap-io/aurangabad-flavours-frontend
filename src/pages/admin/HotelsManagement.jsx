import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, Eye, Star, MapPin, Loader 
} from 'lucide-react';
import { hotelsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const HotelsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, hotel: null });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelsApi.getAll();
      const data = Array.isArray(response) ? response : (response?.data ?? []);
      setHotels(data);
    } catch {
      showToast.error('Error', 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels
    .filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
        || hotel.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all'
        || (filterStatus === 'featured' && hotel.ihmRecommended)
        || (filterStatus === 'verified' && hotel.verified);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'cuisine') return a.cuisine.localeCompare(b.cuisine);
      return 0;
    });

  const handleDelete = async (hotel) => {
    try {
      const hotelId = hotel._id || hotel.id;
      const response = await hotelsApi.delete(hotelId);
      if (response.success || response) {
        setHotels(hotels.filter(h => (h._id || h.id) !== hotelId));
        showToast.success('Deleted', `${hotel.name} removed successfully`);
      } else showToast.error('Error', response.error || 'Delete failed');
    } catch {
      showToast.error('Error', 'Delete failed');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const response = await hotelsApi.toggleFeatured(id);
      const updatedHotel = response.data || response;
      if (updatedHotel) {
        setHotels(hotels.map(h => (h._id || h.id) === id ? updatedHotel : h));
        showToast.success('Success', 'Featured status updated');
      } else showToast.error('Error', response.error || 'Update failed');
    } catch {
      showToast.error('Error', 'Update failed');
    }
  };

  const openDeleteModal = (hotel) => setDeleteModal({ isOpen: true, hotel });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, hotel: null });
  const confirmDelete = () => { if (deleteModal.hotel) handleDelete(deleteModal.hotel); };

  return (
    <div className="w-full p-8 min-h-screen box-border bg-[#0a0a0a] data-[theme=light]:bg-[#f8f9fa] max-[1024px]:w-full max-[1024px]:p-4 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8 max-md:flex-col max-md:items-stretch max-md:gap-2">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 mb-1 m-0 max-[480px]:text-[1.5rem] data-[theme=light]:text-gray-900">Hotels & Restaurants</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Manage your restaurant listings and information</p>
        </div>
        <Link to="/admin/hotels/add" className="inline-flex items-center gap-2 py-2 px-4 border-none rounded-lg bg-gradient-to-br from-purple-500 to-[#9b59b6] text-white font-semibold cursor-pointer transition-all duration-300 no-underline hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(138,43,226,0.2)] hover:shadow-[0_8px_25px_rgba(138,43,226,0.3)]">
          <Plus size={20} /> Add New Hotel
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 max-md:flex-col max-md:items-stretch max-md:gap-2">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Search hotels and restaurants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-[calc(1rem+24px)] rounded-lg border border-white/10 bg-white/5 text-gray-100 outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] data-[theme=light]:bg-white data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
          />
        </div>
        <div className="flex gap-2 max-md:flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-2 px-4 rounded-lg border border-white/10 bg-white/5 text-gray-100 cursor-pointer outline-none transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900 max-md:flex-1">
            <option value="all">All Hotels</option>
            <option value="featured">Featured Only</option>
            <option value="verified">Verified Only</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="py-2 px-4 rounded-lg border border-white/10 bg-white/5 text-gray-100 cursor-pointer outline-none transition-all duration-300 focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900 max-md:flex-1">
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="cuisine">Sort by Cuisine</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0">Loading hotels...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-gray-500">
          <div>
            <Search size={48} className="mx-auto mb-4 text-gray-500" />
            <h3 className="m-0 mb-2 font-semibold text-gray-100 data-[theme=light]:text-gray-900">No hotels found</h3>
            <p className="m-0 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 max-w-none justify-start w-full max-md:grid-cols-1">
          {filteredHotels.map((hotel, index) => {
            const hotelId = hotel._id || hotel.id;
            return (
              <motion.div
                key={hotelId}
              className="rounded-xl border border-white/10 overflow-hidden bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="relative h-[180px] overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {hotel.ihmRecommended && <span className="py-1 px-2 rounded text-[0.75rem] font-semibold text-white bg-gradient-to-br from-purple-500 to-[#9b59b6]">Featured</span>}
                  {hotel.verified && <span className="py-1 px-2 rounded text-[0.75rem] font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-700">Verified</span>}
                </div>
              </div>
              <div className="p-4 max-[480px]:p-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[1.1rem] font-semibold text-gray-100 m-0 data-[theme=light]:text-gray-900 line-clamp-1">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-[0.9rem] text-gray-100 data-[theme=light]:text-gray-900">
                    <Star size={16} fill="#FFD700" color="#FFD700" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-gray-500 text-[0.9rem] m-0 mb-1">{hotel.cuisine}</p>
                  <div className="flex items-center gap-1 text-gray-500 text-[0.9rem] m-0 mb-1">
                    <MapPin size={14} /> <span>{hotel.area}</span>
                  </div>
                  <p className="text-gray-500 text-[0.9rem] m-0 mb-1 font-medium">{hotel.priceRange}</p>
                </div>
                <div className="flex justify-end gap-2 mt-2 max-md:justify-center">
                  <Link to={`/admin/hotels/edit/${hotelId}`} className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-white/5 cursor-pointer text-gray-500 transition-all duration-200 no-underline hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:border-black/10 data-[theme=light]:bg-white/80" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <button className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent cursor-pointer text-gray-500 transition-all duration-200 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 data-[theme=light]:border-black/10" title="View">
                    <Eye size={16} />
                  </button>
                  <button
                    className={`w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent cursor-pointer transition-all duration-200 data-[theme=light]:border-black/10 ${hotel.ihmRecommended ? 'text-amber-500 bg-amber-500/10 border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/20' : 'text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30'}`}
                    onClick={() => toggleFeatured(hotelId)}
                    title="Toggle Featured"
                  >
                    <Star size={16} className={hotel.ihmRecommended ? 'fill-current' : ''} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent cursor-pointer text-gray-500 transition-all duration-200 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 data-[theme=light]:border-black/10" onClick={() => openDeleteModal(hotel)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      )}
      {!loading && filteredHotels.length > 0 && (
        <div className="flex justify-center py-4 text-gray-500 border-t border-white/10 mt-6 data-[theme=light]:border-black/10">
          <p className="m-0">Showing {filteredHotels.length} of {hotels.length} hotels</p>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Hotel"
        message={`Are you sure you want to delete "${deleteModal.hotel?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default HotelsManagement;
