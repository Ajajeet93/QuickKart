import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNewAddress, updateAddress } from '../store/addressSlice';
import { X, LocateFixed, Home, Briefcase, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddressModal = ({ isOpen, onClose, initialData = null }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.addresses);

    const [formData, setFormData] = useState({
        type: 'Home',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        isDefault: false
    });

    // Reset or Populate form
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    type: 'Home',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'India',
                    isDefault: false
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (initialData) {
            result = await dispatch(updateAddress({ id: initialData._id, addressData: formData }));
            if (updateAddress.fulfilled.match(result)) onClose();
        } else {
            result = await dispatch(addNewAddress(formData));
            if (addNewAddress.fulfilled.match(result)) onClose();
        }
    };

    // Geolocation handler
    const handleGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    const streetParts = [
                        data.address.house_number,
                        data.address.road,
                        data.address.neighbourhood,
                        data.address.suburb
                    ].filter(Boolean);

                    setFormData(prev => ({
                        ...prev,
                        street: streetParts.join(', ') || data.display_name.split(',')[0],
                        city: data.address.city || data.address.town || '',
                        state: data.address.state || '',
                        zip: data.address.postcode || '',
                        country: data.address.country || 'India'
                    }));
                } catch (err) {
                    console.error("Geocoding failed", err);
                }
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <h3 className="font-extrabold text-lg text-gray-900">{initialData ? 'Edit Address' : 'New Address'}</h3>
                            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {/* Type Selection */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Address Type</label>
                                <div className="flex gap-2">
                                    {['Home', 'Work', 'Other'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-1.5
                                                ${formData.type === type
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                                        >
                                            {type === 'Home' && <Home size={14} />}
                                            {type === 'Work' && <Briefcase size={14} />}
                                            {type === 'Other' && <MapPin size={14} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Street Address */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Street Address</label>
                                    <button
                                        type="button"
                                        onClick={handleGeolocation}
                                        className="text-[10px] flex items-center gap-1 text-primary font-bold hover:text-green-700 transition bg-green-50 px-2 py-0.5 rounded-full"
                                    >
                                        <LocateFixed size={10} /> Auto-detect
                                    </button>
                                </div>
                                <textarea
                                    placeholder="House No, Street, Landmark"
                                    required
                                    rows="2"
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-gray-50 focus:bg-white font-medium text-sm resize-none"
                                    value={formData.street}
                                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                                />
                            </div>

                            {/* City & State */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">City</label>
                                    <input
                                        type="text" required
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-gray-50 focus:bg-white font-medium text-sm"
                                        value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">State</label>
                                    <input
                                        type="text" required
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-gray-50 focus:bg-white font-medium text-sm"
                                        value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Zip & Country */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Zip Code</label>
                                    <input
                                        type="text" required
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-gray-50 focus:bg-white font-medium text-sm"
                                        value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                                    <input
                                        type="text" required
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-gray-50 focus:bg-white font-medium text-sm"
                                        value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Default Checkbox */}
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isDefault ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                    {formData.isDefault && <Check size={14} className="text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="text-sm font-bold text-gray-700">Set as default address</span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-[#0a6c1a] transition transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                            >
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddressModal;
