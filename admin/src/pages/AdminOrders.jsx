import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders/admin/all');
            setOrders(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/api/orders/admin/${id}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await api.delete(`/api/orders/admin/${id}`);
                fetchOrders();
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Failed to delete order');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Processing': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={14} />;
            case 'Shipped': return <Truck size={14} />;
            case 'Processing': return <Package size={14} />;
            case 'Cancelled': return <AlertCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    // --- Statistics Calculations ---
    // --- Statistics Calculations ---
    const totalOrders = orders.length;

    // Check if order is from today
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const todaysOrdersList = orders.filter(order => isToday(order.createdAt));
    const todaysCount = todaysOrdersList.length;
    const pendingCount = orders.filter(order => order.status === 'Pending' || order.status === 'Processing').length;

    // --- Search & Filtering ---
    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === '' ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.shippingAddress?.phone && order.shippingAddress.phone.includes(searchTerm));
        return matchesSearch;
    });

    const displayedTodaysOrders = filteredOrders.filter(order => isToday(order.createdAt));
    // We show "All Orders" below "Today's Orders", so technically "All Orders" could include today's, 
    // but usually user might want to see history. Let's show filteredOrders as "History" but keep full list.
    // Or better: Show "Today's Orders" distinctly, and then "All Orders" (which includes today's).
    // Let's stick to the prompt: Show one more detail like "Today's Order Section".

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
            {/* Header & Stats */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
                        <p className="text-gray-500 mt-1">Overview of your store's performance</p>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Today's Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900">{todaysCount}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Orders Section (Only visible if there are orders or if searching and they match) */}
            {displayedTodaysOrders.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full"></span>
                        Today's Orders
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold ml-2">New</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {displayedTodaysOrders.map(order => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                                handleStatusChange={handleStatusChange}
                                setSelectedOrder={setSelectedOrder}
                                handleDelete={handleDelete}
                                isToday={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* All Orders Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-gray-300 rounded-full"></span>
                    All Orders History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                                handleStatusChange={handleStatusChange}
                                setSelectedOrder={setSelectedOrder}
                                handleDelete={handleDelete}
                                isToday={false} // Already highlighted above if logic requires, but standard card here
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                                <Search className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No Orders Found</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your search terms or check back later.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal (Reused) */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderModal selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} getStatusColor={getStatusColor} />
                )}
            </AnimatePresence>
        </div>
    );
};

// Extracted Components for cleaner code

const OrderCard = ({ order, getStatusColor, getStatusIcon, handleStatusChange, setSelectedOrder, handleDelete, isToday }) => (
    <div className={`bg-white rounded-2xl shadow-sm border ${isToday ? 'border-primary/30 ring-1 ring-primary/10' : 'border-gray-100'} hover:shadow-md transition-all duration-200 group flex flex-col`}>
        {/* Card Header */}
        <div className="p-5 border-b border-gray-50 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-2 truncate w-full max-w-[200px]">
                    {order.userId?.name || 'Unknown Guest'}
                </h3>
                <p className="text-xs text-gray-500 truncate">{order.shippingAddress?.phone || order.userId?.email}</p>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {order.paymentStatus}
                </span>
            </div>
        </div>

        {/* Card Body - Items Preview */}
        <div className="p-5 flex-grow">
            <div className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items ({order.items.length})</div>
            <div className="flex -space-x-3 overflow-hidden pl-1 py-1">
                {order.items.slice(0, 5).map((item, i) => (
                    <div key={i} className="relative h-10 w-10 rounded-full ring-2 ring-white bg-gray-50 flex-shrink-0" title={item.product?.name}>
                        {item.product?.image ? (
                            <img src={item.product.image} alt="" className="h-full w-full object-cover rounded-full" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">?</div>
                        )}
                    </div>
                ))}
                {order.items.length > 5 && (
                    <div className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 z-10">
                        +{order.items.length - 5}
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {order.items.map(i => i.product?.name || 'Item').join(', ')}
            </p>
        </div>

        {/* Card Footer - Actions */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between gap-3">
            <div className="relative flex-grow">
                <select
                    value={order.status}
                    disabled={order.status === 'Delivered'}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`w-full appearance-none pl-9 pr-8 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all ${getStatusColor(order.status)} ${order.status === 'Delivered' ? 'cursor-not-allowed opacity-100' : 'cursor-pointer'}`}
                >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    {order.status !== 'Delivered' && <option value="Cancelled">Cancelled</option>}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                    {getStatusIcon(order.status)}
                </div>
                {order.status !== 'Delivered' && (
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
                    title="View Details"
                >
                    <Eye size={18} />
                </button>
                <button
                    onClick={() => handleDelete(order._id)}
                    className="p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                    title="Delete Order"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    </div>
);

const OrderModal = ({ selectedOrder, setSelectedOrder, getStatusColor }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Order #{selectedOrder._id.slice(-6).toUpperCase()}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar size={14} />
                        {new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                </div>
                <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <User size={16} className="text-primary" /> Customer Details
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="font-medium text-gray-900">{selectedOrder.userId?.name || 'Unknown User'}</div>
                            <div className="text-sm text-gray-500 mt-1">{selectedOrder.userId?.email}</div>
                            <div className="text-xs text-gray-400 mt-2 font-mono">ID: {selectedOrder.userId?._id}</div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <MapPin size={16} className="text-primary" /> Shipping to
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-full">
                            {selectedOrder.shippingAddress ? (
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="font-medium text-gray-900">{selectedOrder.shippingAddress.name}</div>
                                    <div>{selectedOrder.shippingAddress.addressLine1}</div>
                                    <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</div>
                                    <div className="text-gray-400 mt-2 text-xs">Ph: {selectedOrder.shippingAddress.phone}</div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                                    Address not available
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Package size={16} className="text-primary" /> Order Items ({selectedOrder.items.length})
                    </h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Product</th>
                                    <th className="px-4 py-3 text-center">Variant</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedOrder.items.map((item, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                    {item.product?.image && <img src={item.product.image} alt="" className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="font-medium text-gray-900">{item.product?.name || <span className="text-red-400 italic">Deleted Product</span>}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {item.variant ? (
                                                <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 border border-gray-200">{item.variant.weight}</span>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-900">x{item.quantity}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right font-medium text-gray-500">Subtotal</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">₹{selectedOrder.totalAmount.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            <CreditCard size={16} />
                            <span>Payment Method: <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Payment Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                {selectedOrder.paymentStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all focus:ring-2 focus:ring-gray-200"
                >
                    Close Details
                </button>
            </div>
        </motion.div>
    </motion.div>
);

export default AdminOrders;
