import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import { CheckCircle, XCircle, AlertCircle, Clock, Package, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const UserSupport = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/support/my`, { withCredentials: true });
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching support requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> Approved</span>;
            case 'Rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> Rejected</span>;
            case 'Pending': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12} /> In Review</span>;
            default: return <span className="text-gray-500">{status}</span>;
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/profile" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition text-gray-600 hover:text-green-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Support Tickets</h1>
                        <p className="text-sm text-gray-500">Track status of your returns and issues</p>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Support Requests</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't raised any issues yet. If you have a problem with an order, go to Order Details to report it.</p>
                        <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                            <Package size={18} /> View My Orders
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${req.type === 'Return' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{req.type} Request</p>
                                            <p className="text-xs text-gray-500">Raised on {new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(req.status)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Items */}
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Affected Items ({req.items?.length})</p>
                                            <div className="flex -space-x-3 overflow-hidden py-1">
                                                {req.items?.slice(0, 4).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={item.productId?.image || 'https://via.placeholder.com/80'}
                                                        alt={item.productId?.name}
                                                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-white"
                                                        title={item.productId?.name}
                                                    />
                                                ))}
                                                {req.items?.length > 4 && (
                                                    <div className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        +{req.items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 line-clamp-1">
                                                {req.items?.map(i => i.productId?.name).join(', ')}
                                            </div>
                                        </div>

                                        {/* Reason & Response */}
                                        <div className="flex-1 border-l border-gray-100 pl-4 md:border-l-0 md:pl-0 md:border-t-0 border-t pt-4 md:pt-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Latest Update</p>
                                            {req.adminResponse ? (
                                                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                                                    <p className="font-bold flex items-center gap-1.5 mb-1"><MessageSquare size={14} /> Admin Response:</p>
                                                    <p>"{req.adminResponse}"</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No updates from support team yet. We usually respond within 24 hours.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 font-mono">ID: {req._id.slice(-8).toUpperCase()}</span>
                                        <Link to={`/orders/${req.orderId?._id}`} className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                                            View Order <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSupport;
