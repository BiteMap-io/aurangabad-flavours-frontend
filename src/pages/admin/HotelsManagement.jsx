import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2, Eye, Star, MapPin, Loader, Check, X, Clock, ShieldAlert,
  User, Mail, Phone, Calendar, UtensilsCrossed, Image as ImageIcon, ShieldCheck
} from 'lucide-react';
import { hotelsApi } from '../../services/adminApi';
import { showToast } from '../../components/admin/Toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const APPROVAL_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const HotelsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [approvalTab, setApprovalTab] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, hotel: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, hotel: null, reason: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, hotel: null, data: null, loading: false });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      // Admin token unlocks every approval status, not just public/approved listings.
      const response = await hotelsApi.getAll('all');
      const data = Array.isArray(response) ? response : (response?.data ?? []);
      setHotels(data);
    } catch {
      showToast.error('Error', 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = hotels.filter(h => h.approvalStatus === 'pending').length;

  const filteredHotels = hotels
    .filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
        || hotel.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all'
        || (filterStatus === 'featured' && hotel.ihmRecommended)
        || (filterStatus === 'verified' && hotel.verified);
      const matchesApproval = approvalTab === 'all'
        || (hotel.approvalStatus || 'approved') === approvalTab;
      return matchesSearch && matchesFilter && matchesApproval;
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

  const handleApprove = async (hotel) => {
    try {
      const hotelId = hotel._id || hotel.id;
      const response = await hotelsApi.approve(hotelId);
      const updated = response.data || response;
      setHotels(prev => prev.map(h => (h._id || h.id) === hotelId ? updated : h));
      showToast.success('Approved', `${hotel.name} is now live`);
    } catch {
      showToast.error('Error', 'Failed to approve restaurant');
    }
  };

  const openRejectModal = (hotel) => setRejectModal({ isOpen: true, hotel, reason: '' });
  const closeRejectModal = () => setRejectModal({ isOpen: false, hotel: null, reason: '' });

  const openViewModal = async (hotel) => {
    setViewModal({ isOpen: true, hotel, data: null, loading: true });
    try {
      const response = await hotelsApi.getAdminView(hotel._id || hotel.id);
      const data = response.data || response;
      setViewModal({ isOpen: true, hotel, data, loading: false });
    } catch {
      showToast.error('Error', 'Failed to load restaurant details');
      setViewModal({ isOpen: true, hotel, data: null, loading: false });
    }
  };
  const closeViewModal = () => setViewModal({ isOpen: false, hotel: null, data: null, loading: false });

  const confirmReject = async () => {
    const hotel = rejectModal.hotel;
    if (!hotel) return;
    try {
      const hotelId = hotel._id || hotel.id;
      const response = await hotelsApi.reject(hotelId, rejectModal.reason);
      const updated = response.data || response;
      setHotels(prev => prev.map(h => (h._id || h.id) === hotelId ? updated : h));
      showToast.success('Rejected', `${hotel.name} was rejected`);
      closeRejectModal();
    } catch {
      showToast.error('Error', 'Failed to reject restaurant');
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

      <div className="flex gap-2 mb-6 flex-wrap">
        {APPROVAL_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setApprovalTab(tab.key)}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-[0.85rem] font-medium border transition-all duration-200 cursor-pointer
              ${approvalTab === tab.key
                ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 data-[theme=light]:bg-white data-[theme=light]:border-black/10'}`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-black text-[0.7rem] font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
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
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {hotel.ihmRecommended && <span className="py-1 px-2 rounded text-[0.75rem] font-semibold text-white bg-gradient-to-br from-purple-500 to-[#9b59b6]">Featured</span>}
                  {hotel.verified && <span className="py-1 px-2 rounded text-[0.75rem] font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-700">Verified</span>}
                  {hotel.approvalStatus === 'pending' && (
                    <span className="flex items-center gap-1 py-1 px-2 rounded text-[0.75rem] font-semibold text-black bg-amber-400"><Clock size={11} /> Pending</span>
                  )}
                  {hotel.approvalStatus === 'rejected' && (
                    <span className="flex items-center gap-1 py-1 px-2 rounded text-[0.75rem] font-semibold text-white bg-red-500"><ShieldAlert size={11} /> Rejected</span>
                  )}
                  {hotel.ownerId && <span className="py-1 px-2 rounded text-[0.75rem] font-semibold text-white bg-black/60">Owner-submitted</span>}
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
                  {hotel.approvalStatus === 'rejected' && hotel.rejectionReason && (
                    <p className="text-red-400 text-[0.8rem] bg-red-500/10 border border-red-500/20 rounded-md p-2 mt-1">{hotel.rejectionReason}</p>
                  )}
                </div>

                {hotel.approvalStatus === 'pending' && (
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => handleApprove(hotel)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[0.85rem] font-semibold cursor-pointer hover:bg-emerald-500/25 transition-all">
                      <Check size={15} /> Approve
                    </button>
                    <button onClick={() => openRejectModal(hotel)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-[0.85rem] font-semibold cursor-pointer hover:bg-red-500/25 transition-all">
                      <X size={15} /> Reject
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-2 max-md:justify-center">
                  <Link to={`/admin/hotels/edit/${hotelId}`} className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-white/5 cursor-pointer text-gray-500 transition-all duration-200 no-underline hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 data-[theme=light]:border-black/10 data-[theme=light]:bg-white/80" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => openViewModal(hotel)} className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-md bg-transparent cursor-pointer text-gray-500 transition-all duration-200 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 data-[theme=light]:border-black/10" title="View details">
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

      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeRejectModal(); }}>
          <div className="w-full max-w-[420px] bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 data-[theme=light]:bg-white">
            <h3 className="text-[1.1rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">Reject "{rejectModal.hotel?.name}"?</h3>
            <p className="text-gray-500 text-[0.85rem] m-0">Let the owner know what to fix (optional).</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-[0.9rem] focus:outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
              rows={3}
              placeholder="e.g. Photos are too blurry, please re-upload"
              value={rejectModal.reason}
              onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button onClick={closeRejectModal} className="py-2 px-4 rounded-lg text-gray-400 border border-white/10 bg-transparent cursor-pointer hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={confirmReject} className="py-2 px-4 rounded-lg bg-red-500 text-white font-semibold border-none cursor-pointer hover:bg-red-600 transition-all">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* View / verification modal — who submitted it + full restaurant details */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeViewModal(); }}>
          <div className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 data-[theme=light]:bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-[1.2rem] font-bold text-gray-100 m-0 data-[theme=light]:text-gray-900">{viewModal.hotel?.name}</h3>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={20} /></button>
            </div>

            {viewModal.loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Loader size={32} className="animate-spin mb-3 text-purple-500" />
                <p className="m-0">Loading details...</p>
              </div>
            ) : !viewModal.data ? (
              <p className="text-gray-500 text-[0.9rem] m-0">Couldn't load details.</p>
            ) : (
              <>
                {/* Submitted by */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20 data-[theme=light]:bg-black/5">
                  <h4 className="flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-wide text-gray-500 m-0 mb-3">
                    <User size={13} /> Submitted By
                  </h4>
                  {viewModal.data.owner ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-100 data-[theme=light]:text-gray-900 font-semibold text-[0.95rem]">
                        <User size={14} className="text-purple-400" /> {viewModal.data.owner.name}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-[0.85rem]">
                        <Mail size={14} /> {viewModal.data.owner.email}
                      </div>
                      {viewModal.data.owner.phone && (
                        <div className="flex items-center gap-2 text-gray-400 text-[0.85rem]">
                          <Phone size={14} /> {viewModal.data.owner.phone}
                        </div>
                      )}
                      {viewModal.data.owner.joinedAt && (
                        <div className="flex items-center gap-2 text-gray-500 text-[0.8rem]">
                          <Calendar size={14} /> Account created {new Date(viewModal.data.owner.joinedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-gray-400 text-[0.85rem] m-0">
                      <ShieldCheck size={14} /> Added directly by an admin (no owner account)
                    </p>
                  )}
                </div>

                {/* Restaurant details */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20 data-[theme=light]:bg-black/5">
                  <h4 className="flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-wide text-gray-500 m-0 mb-3">
                    <UtensilsCrossed size={13} /> Restaurant Details
                  </h4>
                  <div className="flex flex-col gap-2 text-[0.85rem]">
                    {viewModal.data.restaurant.description && (
                      <p className="text-gray-300 data-[theme=light]:text-gray-700 leading-relaxed m-0">{viewModal.data.restaurant.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1 text-gray-400">
                      <span><strong className="text-gray-300 data-[theme=light]:text-gray-700 font-medium">Cuisine:</strong> {viewModal.data.restaurant.cuisine}</span>
                      <span><strong className="text-gray-300 data-[theme=light]:text-gray-700 font-medium">Type:</strong> {viewModal.data.restaurant.establishmentType}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {viewModal.data.restaurant.area}</span>
                      <span><strong className="text-gray-300 data-[theme=light]:text-gray-700 font-medium">Price:</strong> {viewModal.data.restaurant.priceRange}</span>
                    </div>
                    {viewModal.data.restaurant.address && (
                      <p className="text-gray-500 text-[0.8rem] m-0 mt-1">{viewModal.data.restaurant.address}</p>
                    )}
                  </div>

                  {viewModal.data.restaurant.gallery?.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-none">
                      <ImageIcon size={13} className="text-gray-500 shrink-0" />
                      {[viewModal.data.restaurant.image, ...viewModal.data.restaurant.gallery].filter(Boolean).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-14 h-14 rounded-md object-cover shrink-0 border border-white/10" />
                      ))}
                    </div>
                  )}

                  <p className="flex items-center gap-1.5 text-gray-500 text-[0.78rem] m-0 mt-3">
                    <Calendar size={12} /> Submitted {new Date(viewModal.data.restaurant.createdAt).toLocaleString()}
                  </p>
                </div>

                {viewModal.data.restaurant.approvalStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { handleApprove(viewModal.hotel); closeViewModal(); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[0.9rem] font-semibold cursor-pointer hover:bg-emerald-500/25 transition-all"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => { closeViewModal(); openRejectModal(viewModal.hotel); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[0.9rem] font-semibold cursor-pointer hover:bg-red-500/25 transition-all"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsManagement;
