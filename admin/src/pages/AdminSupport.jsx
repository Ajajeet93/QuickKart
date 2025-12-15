import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, AlertCircle, Clock, Eye, Package, User, FileText, Send } from 'lucide-react';
import API_URL from '../config';

const AdminSupport = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/support/admin/all`, { withCredentials: true });
            setRequests(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching support requests:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setProcessingId(id);
        try {
            await axios.put(`${API_URL}/api/support/admin/${id}/status`, {
                status,
                adminResponse: adminNote || (status === 'Approved' ? 'Your request has been approved.' : 'Your request has been rejected.')
            }, { withCredentials: true });

            // Close modal if open
            if (selectedRequest && selectedRequest._id === id) {
                closeModal();
            }

            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const openModal = (req) => {
        setSelectedRequest(req);
        setAdminNote(req.adminResponse || '');
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setAdminNote('');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> Approved</span>;
            case 'Rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> Rejected</span>;
            case 'Pending': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12} /> Pending</span>;
            default: return <span className="text-gray-500">{status}</span>;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="p-6 max-w-[1200px] mx-auto min-h-screen">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Support & Returns</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Request Details</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map(req => (
                            <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{req.type}</div>
                                    <div className="text-xs text-gray-500 mt-1">Order #{req.orderId?._id.slice(-6).toUpperCase()}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{req.userId?.name}</div>
                                    <div className="text-xs text-gray-500">{req.userId?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-xs truncate" title={req.reason}>
                                        <span className="font-medium text-gray-700">{req.reason}</span>
                                        {req.description && <p className="text-xs text-gray-500 mt-1 truncate">{req.description}</p>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(req.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openModal(req)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <Eye size={14} /> View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <AlertCircle size={32} className="text-gray-300 mb-2" />
                                        <p>No support requests found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {selectedRequest.type} Request
                                    {getStatusBadge(selectedRequest.status)}
                                </h3>
                                <p className="text-sm text-gray-500">RID: {selectedRequest._id}</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Items Section */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Package size={16} /> Affected Items
                                </h4>
                                <div className="space-y-3">
                                    {selectedRequest.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                                            <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 p-1 shrink-0">
                                                <img
                                                    src={item.productId?.image || 'https://via.placeholder.com/80'}
                                                    alt={item.productId?.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{item.productId?.name || 'Unknown Product'}</p>
                                                <p className="text-xs text-gray-500">Variant: {item.variant?.weight}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Reason Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertCircle size={16} /> Issue Details
                                    </h4>
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="font-bold text-red-800 mb-1">{selectedRequest.reason}</p>
                                        <p className="text-sm text-red-600 italic">"{selectedRequest.description || 'No description provided.'}"</p>
                                    </div>
                                </div>

                                {/* User & Order Info */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <User size={16} /> Customer Info
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                                        <p className="font-bold text-gray-900">{selectedRequest.userId?.name}</p>
                                        <p className="text-gray-500 mb-2">{selectedRequest.userId?.email}</p>
                                        <div className="h-px bg-gray-200 my-2"></div>
                                        <p className="text-gray-500">Order ID: <span className="font-mono text-gray-700">#{selectedRequest.orderId?._id.slice(-6).toUpperCase()}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Action Section */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FileText size={16} /> Admin Response
                                </h4>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Add a note for the user (optional for approval, recommended for rejection)..."
                                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                                    disabled={selectedRequest.status !== 'Pending'}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
                            >
                                Close
                            </button>

                            {selectedRequest.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Rejected')}
                                        disabled={processingId === selectedRequest._id}
                                        className="px-5 py-2.5 bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl hover:bg-red-200 transition"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Approved')}
                                        disabled={processingId === selectedRequest._id}
                                        className="px-5 py-2.5 bg-green-600 text-white shadow-lg shadow-green-200 font-bold rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Approve Request
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSupport;
