import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_URL from '../config';
import { Package, MapPin, Calendar, CreditCard, ArrowLeft, AlertCircle, Clock, Wallet, Receipt, ChevronRight, Hash, User, XCircle, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useSelector((state) => state.auth);

    // Support Request State
    const [requests, setRequests] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStep, setReportStep] = useState(1); // 1: Select Items, 2: Details
    const [selectedIssueItems, setSelectedIssueItems] = useState([]); // Array of item objects
    const [reportType, setReportType] = useState('Return');
    const [reportReason, setReportReason] = useState('Quality Issue');
    const [reportDescription, setReportDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${API_URL}/api/orders/${id}`, {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                } else {
                    const errData = await response.json();
                    setError(errData.message || 'Order not found');
                }
            } catch (err) {
                setError('Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        const fetchRequests = async () => {
            try {
                const res = await fetch(`${API_URL}/api/support/order/${id}`, {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setRequests(data);
                    } else {
                        setRequests([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        fetchOrder();
        fetchRequests();

        const interval = setInterval(() => {
            fetchOrder();
            fetchRequests();
        }, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const handleOpenReport = () => {
        setSelectedIssueItems([]);
        setReportStep(1);
        setReportType('Return');
        setReportReason('Quality Issue');
        setReportDescription('');
        setShowReportModal(true);
    };

    const toggleItemSelection = (item) => {
        // Check if already selected
        const isSelected = selectedIssueItems.some(i => i._id === item._id && i.product._id === item.product._id);
        if (isSelected) {
            setSelectedIssueItems(prev => prev.filter(i => !(i._id === item._id && i.product._id === item.product._id)));
        } else {
            setSelectedIssueItems(prev => [...prev, item]);
        }
    };

    const submitReport = async () => {
        if (selectedIssueItems.length === 0) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/support/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order._id,
                    items: selectedIssueItems.map(item => ({
                        productId: item.product._id,
                        quantity: item.quantity,
                        variant: item.variant
                    })),
                    type: reportType,
                    reason: reportReason,
                    description: reportDescription
                }),
                credentials: 'include'
            });

            if (res.ok) {
                alert('Request submitted successfully!');
                setShowReportModal(false);
                // Refresh requests
                const reqRes = await fetch(`${API_URL}/api/support/order/${id}`, { credentials: 'include' });
                if (reqRes.ok) {
                    const data = await reqRes.json();
                    if (Array.isArray(data)) setRequests(data);
                }
            } else {
                const errData = await res.json();
                alert(`Failed: ${errData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Error submitting request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRequestStatusForItem = (itemId) => {
        if (!Array.isArray(requests)) return null;
        const req = requests.find(r => r.items && r.items.some(i => i.productId === itemId));
        return req ? req.status : null;
    };

    if (loading) return <LoadingSpinner />;

    if (error || !order) return (
        <div className="min-h-screen pt-32 px-4 text-center">
            <div className="inline-flex bg-red-50 p-4 rounded-full text-red-500 mb-4">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Order not found'}</h2>
            <Link to="/orders" className="text-primary font-bold hover:underline">Return to Orders</Link>
        </div>
    );

    // Calculate eligible items for reporting (Delivered and not already requested)
    const canReportIssue = order.status === 'Delivered';

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header / Back */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/orders" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition text-gray-600 hover:text-primary">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Summary</h1>
                        <p className="text-sm text-gray-500">View your order details and invoice</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* SECTION 1: ORDER ITEMS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="text-primary" size={20} />
                                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {order.items?.length || 0} Items
                                </span>
                            </div>

                            {/* Global Report Button */}
                            {canReportIssue && (
                                <button
                                    onClick={handleOpenReport}
                                    className="text-sm font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                                >
                                    <AlertCircle size={16} />
                                    Return / Exchange
                                </button>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {order.items?.map((item, idx) => {
                                    const requestStatus = getRequestStatusForItem(item.product?._id);
                                    return (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                            <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 p-1 shrink-0 relative">
                                                <img
                                                    src={item.product?.image || 'https://via.placeholder.com/80'}
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                                {/* Status Badge Overlay */}
                                                {requestStatus && (
                                                    <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm border ${requestStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        requestStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {requestStatus === 'Pending' ? 'In Review' : requestStatus}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.product?.name || 'Unknown Item'}</h4>
                                                        <p className="text-xs text-gray-500">Category: {item.product?.category}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md">
                                                        {item.quantity} × ₹{item.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: BILL / PAYMENT SUMMARY */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            <Receipt className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-gray-900">Bill Details</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center py-2 text-gray-600 text-sm">
                                <span>Item Total</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-gray-600 text-sm">
                                <span>Delivery Fee</span>
                                <span className="text-primary">Free</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-gray-600 text-sm">
                                <span>Platform Fee</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="h-px bg-dashed bg-gray-200 my-4"></div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-base font-bold text-gray-900">Total Amount</span>
                                <span className="text-xl font-bold text-primary">₹{order.totalAmount}</span>
                            </div>
                            <div className="mt-4 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Paid via {order.paymentMethod || 'Credit Card'}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: ORDER DETAIL (FULL DETAILS) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            <Hash className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                        </div>
                        <div className="divide-y divide-gray-100">

                            {/* Meta Row: ID, Status, Date */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order ID</p>
                                    <p className="font-mono font-bold text-gray-900 text-lg">#{order._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500 break-all">{order._id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Track Order</p>

                                    <div className="relative mb-8 px-2">
                                        {/* Progress Line Background */}
                                        <div className="absolute top-3 left-0 w-full h-1 bg-gray-100 rounded"></div>

                                        {/* Active Progress Line */}
                                        <div
                                            className="absolute top-3 left-0 h-1 bg-green-500 rounded transition-all duration-500 ease-out"
                                            style={{
                                                width: `${['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status) * 33.33
                                                    }%`
                                            }}
                                        ></div>

                                        {/* Steps */}
                                        <div className="relative flex justify-between w-full">
                                            {['Order Received', 'Packing Order', 'Order on the way', 'Order Delivered'].map((step, index) => {
                                                const statusMap = { 'Pending': 0, 'Processing': 1, 'Shipped': 2, 'Delivered': 3 };
                                                const currentStatusIdx = statusMap[order.status] || 0;
                                                const isCompleted = index <= currentStatusIdx;

                                                return (
                                                    <div key={index} className="flex flex-col items-center group">
                                                        <div
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${isCompleted
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'bg-white border-gray-200 text-gray-300'
                                                                }`}
                                                        >
                                                            {isCompleted ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide mt-2 text-center absolute -bottom-6 w-24 ${isCompleted ? 'text-green-600' : 'text-gray-400'
                                                            }`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ordered On</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar size={18} className="text-gray-400" />
                                        <span className="font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Time</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock size={18} className="text-gray-400" />
                                        <span className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address & User */}
                            <div className="p-6">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Delivery Location
                                </p>
                                {order.shippingAddress ? (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-700">
                                                {order.shippingAddress.type || 'Home'}
                                            </span>
                                        </div>
                                        <p className="text-gray-900 font-bold mb-1">{order.shippingAddress.street}</p>
                                        <p className="text-gray-600 text-sm">
                                            {order.shippingAddress.city}, {order.shippingAddress.zip}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Address details unavailable.</p>
                                )}
                            </div>

                            {/* Additional Info */}
                            <div className="p-6 bg-gray-50/30">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                        <p className="font-bold text-gray-900 flex items-center gap-2">
                                            {order.paymentMethod === 'Wallet' ? <Wallet size={16} className="text-green-600" /> : <CreditCard size={16} />}
                                            {order.paymentMethod || 'Card'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                                        <p className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {order.paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
                        onClick={() => setShowReportModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {reportStep === 1 ? 'Select Items' : 'Report Details'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {reportStep === 1 ? 'Which items have an issue?' : 'Tell us what went wrong'}
                                    </p>
                                </div>
                                <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="p-5 overflow-y-auto">
                                {reportStep === 1 ? (
                                    <div className="space-y-3">
                                        {order.items?.map((item, idx) => {
                                            // Check if already has a request
                                            const existingStatus = getRequestStatusForItem(item.product?._id);
                                            const isSelected = selectedIssueItems.some(i => i._id === item._id && i.product._id === item.product._id);

                                            if (existingStatus) return null; // Don't show already reported items

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => toggleItemSelection(item)}
                                                    className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                        ? 'border-primary bg-green-50/50 ring-1 ring-primary/20'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                        }`}
                                                >
                                                    <div className={`shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-gray-300'}`}>
                                                        {isSelected ? <CheckSquare size={24} className="fill-green-100" /> : <Square size={24} />}
                                                    </div>
                                                    <div className="w-14 h-14 bg-white rounded-lg border border-gray-100 p-1 shrink-0">
                                                        <img
                                                            src={item.product?.image || 'https://via.placeholder.com/80'}
                                                            alt={item.product?.name}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-sm">{item.product?.name}</h4>
                                                        <p className="text-xs text-gray-500">{item.weight} • {item.quantity} qty</p>
                                                    </div>
                                                    <div className="font-bold text-gray-900 text-sm">
                                                        ₹{item.price}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Empty State if all items reported */}
                                        {order.items?.every(item => getRequestStatusForItem(item.product?._id)) && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                                                <p>All items in this order have already been reported.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Selected Items Summary */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {selectedIssueItems.map((item, idx) => (
                                                <div key={idx} className="shrink-0 w-12 h-12 rounded border border-gray-200 p-0.5 relative">
                                                    <img src={item.product?.image} className="w-full h-full object-cover rounded" />
                                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">What do you want to do?</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Return', 'Replacement'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setReportType(type)}
                                                        className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${reportType === type
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-green-200'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for issue</label>
                                            <div className="relative">
                                                <select
                                                    value={reportReason}
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                                                >
                                                    <option value="Quality Issue">🥬 Quality Issue (Spoiled/Rotten)</option>
                                                    <option value="Not Fresh">🥀 Not Fresh / Withered</option>
                                                    <option value="Insect Found">🐛 Insect / Worm Found</option>
                                                    <option value="Damaged/Crushed">📦 Damaged / Crushed Item</option>
                                                    <option value="Expired">📅 Expired Product</option>
                                                    <option value="Wrong Item">🔄 Wrong Item Received</option>
                                                    <option value="Item Missing">❌ Item Missing</option>
                                                    <option value="Weight Issue">⚖️ Weight / Quantity Issue</option>
                                                    <option value="Other">📝 Other</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                                            <textarea
                                                value={reportDescription}
                                                onChange={(e) => setReportDescription(e.target.value)}
                                                placeholder="Please describe the issue in detail..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer - Sticky */}
                            <div className="p-5 border-t border-gray-100 bg-white rounded-b-2xl sticky bottom-0">
                                {reportStep === 1 ? (
                                    <button
                                        onClick={() => setReportStep(2)}
                                        disabled={selectedIssueItems.length === 0}
                                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedIssueItems.length > 0
                                            ? 'bg-primary text-white shadow-lg shadow-green-200 hover:bg-[#0a6c1a]'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Next Step <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setReportStep(1)}
                                            className="py-3.5 px-6 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={submitReport}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-[#0a6c1a] transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Submit Request <CheckSquare size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderDetails;
