import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, MapPin, Edit2, Trash2, Home, Briefcase } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, deleteAddress } from '../store/addressSlice';
import AddressModal from '../components/AddressModal';

const ManageAddresses = () => {
    const dispatch = useDispatch();
    const { list: addresses, loading } = useSelector((state) => state.addresses);

    const [showModal, setShowModal] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);

    // Fetch Addresses on Mount
    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        dispatch(deleteAddress(id));
    };

    const openEdit = (addr) => {
        setAddressToEdit(addr);
        setShowModal(true);
    };

    const openAdd = () => {
        setAddressToEdit(null);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/profile" className="p-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ChevronRight size={20} className="rotate-180" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
                        <p className="text-gray-500 text-sm">Manage your delivery locations</p>
                    </div>
                </div>

                {/* Content */}
                {loading && addresses.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Add New Card */}
                        <button
                            onClick={openAdd}
                            className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all group"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold">Add New Address</span>
                        </button>

                        {/* Address Cards */}
                        {addresses.map(addr => (
                            <div key={addr._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${addr.type === 'Work' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {addr.type === 'Work' ? <Briefcase size={18} /> : <Home size={18} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{addr.type}</h3>
                                            {addr.isDefault && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Default</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(addr)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-600">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(addr._id)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-1">{addr.street}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {addr.city}, {addr.state} {addr.zip}
                                </p>
                                <p className="text-gray-400 text-xs font-bold mt-4 uppercase">{addr.country}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reusable Address Modal */}
            <AddressModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setAddressToEdit(null);
                }}
                initialData={addressToEdit}
            />
        </div>
    );
};

export default ManageAddresses;
