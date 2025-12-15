import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import { Package, Calendar, ChevronRight, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Don't set loading on poll updates to prevent flashing
                // Only if it's the very first load and we have no data
                const response = await fetch(`${API_URL}/api/orders/my`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch orders');

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders(); // Initial fetch

        // Poll every 3 seconds to show live simulation progress
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, []);

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'Order delivered';
            case 'cancelled': return 'Order cancelled';
            case 'shipped': return 'Order on the way';
            case 'processing': return 'Packing Order';
            default: return 'Order received';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <CheckCircle size={20} className="text-white fill-green-500" />;
            case 'cancelled': return <XCircle size={20} className="text-white fill-red-500" />; // Filled style matching image
            case 'shipped': return <Package size={20} className="text-purple-600" />;
            case 'processing': return <Clock size={20} className="text-blue-600" />;
            default: return <Clock size={20} className="text-gray-400" />;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-2xl mx-auto">
                {/* Header matching image: Back arrow + Title */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="p-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50">
                            <ChevronRight size={20} className="rotate-180" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
                    </div>

                    <Link to="/support/tickets" className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-lg transition">
                        View Support Tickets
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Package size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <Link to="/" className="text-primary font-bold hover:underline">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                to={`/orders/${order._id}`}
                                key={order._id}
                                className="block bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                {/* Top Row: Title + Icon ...... Price + Arrow */}
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {getStatusText(order.status)}
                                        </h3>
                                        {/* Icon directly next to text as per image */}
                                        <div>{getStatusIcon(order.status)}</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-900">₹{order.totalAmount}</span>
                                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Subtext: Date */}
                                <p className="text-sm text-gray-500 mb-4">
                                    Placed at {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                    {order.deliverySlot && (
                                        <span className="block mt-1 text-emerald-600 font-bold text-xs flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            Delivery Slot: {order.deliverySlot}
                                        </span>
                                    )}
                                </p>

                                {/* Footer: Images (Left) + Mini Tracker (Right) */}
                                <div className="flex items-end justify-between gap-4">
                                    {/* Images Row */}
                                    <div className="flex items-center gap-3">
                                        {order.items?.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className="w-16 h-16 border border-gray-100 rounded-lg p-1 bg-gray-50 flex-shrink-0">
                                                <img
                                                    src={item.product?.image}
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                />
                                            </div>
                                        ))}
                                        {order.items?.length > 4 && (
                                            <div className="w-16 h-16 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mini Visual Stepper */}
                                    <div className="flex-1 max-w-[200px] pb-2 hidden sm:block">
                                        <div className="relative">
                                            {/* Line Bg */}
                                            <div className="absolute top-1.5 left-0 w-full h-0.5 bg-gray-100 rounded"></div>
                                            {/* Line Active */}
                                            <div
                                                className="absolute top-1.5 left-0 h-0.5 bg-green-500 rounded transition-all duration-500"
                                                style={{ width: `${['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status) * 33.33}%` }}
                                            ></div>

                                            <div className="relative flex justify-between w-full">
                                                {[0, 1, 2, 3].map((step, index) => {
                                                    const statusMap = { 'Pending': 0, 'Processing': 1, 'Shipped': 2, 'Delivered': 3 };
                                                    const isCompleted = index <= (statusMap[order.status] || 0);
                                                    return (
                                                        <div key={index} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'}`}>
                                                            {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase mt-1">
                                            <span>Placed</span>
                                            <span>Packed</span>
                                            <span>Way</span>
                                            <span>Done</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
