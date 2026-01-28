import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, Eye, Star, MapPin, Loader 
} from 'lucide-react';
import { hotelsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import ConfirmModal from '../../components/admin/ConfirmModal';
import './HotelsManagement.css';

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
      if (response.success) setHotels(response.data);
      else showToast.error('Error', 'Failed to load hotels');
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
      const response = await hotelsApi.delete(hotel.id);
      if (response.success) {
        setHotels(hotels.filter(h => h.id !== hotel.id));
        showToast.success('Deleted', `${hotel.name} removed successfully`);
      } else showToast.error('Error', response.error || 'Delete failed');
    } catch {
      showToast.error('Error', 'Delete failed');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const response = await hotelsApi.toggleFeatured(id);
      if (response.success) {
        setHotels(hotels.map(h => h.id === id ? response.data : h));
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
    <div className="hotels-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Hotels & Restaurants</h1>
          <p>Manage your restaurant listings and information</p>
        </div>
        <Link to="/admin/hotels/add" className="btn-primary">
          <Plus size={20} /> Add New Hotel
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            placeholder="Search hotels and restaurants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Hotels</option>
            <option value="featured">Featured Only</option>
            <option value="verified">Verified Only</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="cuisine">Sort by Cuisine</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>Loading hotels...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <Search size={48} />
            <h3>No hotels found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>
      ) : (
        <div className="hotels-grid">
          {filteredHotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              className="hotel-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="hotel-image">
                <img src={hotel.image} alt={hotel.name} />
                <div className="hotel-badges">
                  {hotel.ihmRecommended && <span className="badge featured">Featured</span>}
                  {hotel.verified && <span className="badge verified">Verified</span>}
                </div>
              </div>
              <div className="hotel-content">
                <div className="hotel-header">
                  <h3>{hotel.name}</h3>
                  <div className="hotel-rating">
                    <Star size={16} fill="#FFD700" color="#FFD700" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>
                <div className="hotel-details">
                  <p className="cuisine">{hotel.cuisine}</p>
                  <div className="location">
                    <MapPin size={14} /> <span>{hotel.area}</span>
                  </div>
                  <p className="price-range">{hotel.priceRange}</p>
                </div>
                <div className="hotel-actions">
                  <Link to={`/admin/hotels/edit/${hotel.id}`} className="action-btn edit" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <button className="action-btn view" title="View">
                    <Eye size={16} />
                  </button>
                  <button
                    className={`action-btn feature ${hotel.ihmRecommended ? 'active' : ''}`}
                    onClick={() => toggleFeatured(hotel.id)}
                    title="Toggle Featured"
                  >
                    <Star size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => openDeleteModal(hotel)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && filteredHotels.length > 0 && (
        <div className="pagination">
          <p>Showing {filteredHotels.length} of {hotels.length} hotels</p>
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
