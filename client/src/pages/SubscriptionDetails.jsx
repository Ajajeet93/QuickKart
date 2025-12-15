import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { Calendar, MapPin, CreditCard, ChevronLeft, Package, Clock, XCircle, Trash2, Plus, Minus, Check } from 'lucide-react';

const SubscriptionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sub, setSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [frequency, setFrequency] = useState('');
    const [saved, setSaved] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (sub) {
            if (sub.items && sub.items.length > 0) {
                setQuantity(sub.items[0].quantity);
            }
            setFrequency(sub.frequency);
        }
    }, [sub]);

    useEffect(() => {
        const fetchSub = async () => {
            try {
                const res = await fetch(`${API_URL}/api/subscriptions/${id}`, {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                setSub(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSub();
    }, [id]);

    const handleUpdate = async (updates) => {
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updates)
            });
            const updated = await res.json();
            setSub(updated);
            // setQuantity will be updated by the useEffect above
            if (updates.status !== 'Cancelled') {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const hasChanges = sub && (quantity !== sub.items[0].quantity || frequency !== sub.frequency);



    if (loading) return <div className="flex justify-center pt-24"><div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div></div>;
    if (!sub) return <div className="text-center pt-24">Subscription not found</div>;

    const product = sub.items[0]?.product;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <Link to="/subscriptions" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition">
                    <ChevronLeft size={20} /> Back to My Subscriptions
                </Link>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Main Content */}
                    <div className="flex-1 w-full space-y-6">
                        {/* Header Card - Subscription Summary */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Package size={120} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Subscription #{sub._id.slice(-6).toUpperCase()}</h1>
                                        <p className="text-gray-500 mt-1">
                                            {sub.items.length} Item{sub.items.length !== 1 ? 's' : ''} • Created on {new Date(sub.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${sub.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        sub.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Next Delivery</p>
                                            <p className="font-bold text-gray-900">{new Date(sub.nextDeliveryDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Delivery Address</p>
                                            <p className="font-bold text-gray-900 truncate max-w-[200px]">{sub.addressList?.find(a => a._id === sub.deliveryAddress)?.street || 'Selected Address'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package size={20} className="text-primary" /> Subscription Items
                            </h3>
                            <div className="space-y-6">
                                {sub.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                            <img
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-gray-900">{item.product?.name}</h4>
                                                <span className="font-bold text-gray-900">₹{(item.product?.price * 0.85 * item.quantity).toFixed(2)}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{item.quantity} x ₹{(item.product?.price * 0.85).toFixed(2)} (15% off)</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Deliveries (Visual Polish Placeholder) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Delivery History</h3>
                            <div className="space-y-4">
                                {/* Mock history items */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Delivered</p>
                                            <p className="text-xs text-gray-500">Oct 24, 2024</p>
                                        </div>
                                    </div>
                                    <Link to="#" className="text-primary text-sm font-medium hover:underline">View Order</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="w-full md:w-80 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6">Subscription Settings</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Frequency</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['daily', 'weekly', 'monthly'].map((freq) => (
                                            <button
                                                key={freq}
                                                onClick={() => setFrequency(freq)}
                                                disabled={sub.status === 'Cancelled'}
                                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border capitalize cursor-pointer active:scale-95 ${frequency === freq
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-green-100"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    }`}
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                                    <div className="flex items-center justify-between gap-1 bg-gray-50 p-1 rounded-full border border-gray-200 h-12 w-full">
                                        <button
                                            onClick={() => quantity > 1 && setQuantity(prev => prev - 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:text-primary transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative z-10 active:scale-95"
                                            disabled={sub.status === 'Cancelled' || quantity <= 1}
                                        >
                                            <Minus size={16} className="pointer-events-none" />
                                        </button>
                                        <span className="font-bold text-gray-900 text-lg flex-1 text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(prev => prev + 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:text-primary transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative z-10 active:scale-95"
                                            disabled={sub.status === 'Cancelled'}
                                        >
                                            <Plus size={16} className="pointer-events-none" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate({ quantity, frequency })}
                                        disabled={(!hasChanges && !saved) || updating}
                                        className={`w-full mt-3 py-2 rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center gap-2 active:scale-[0.98] ${saved
                                            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                                            : !hasChanges
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                                            }`}
                                    >
                                        {updating ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : saved ? (
                                            <>
                                                <Check size={16} /> Saved!
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    {sub.status === 'Cancelled' && (
                                        <div className="text-center text-red-600 font-medium bg-red-50 p-3 rounded-xl">
                                            Subscripton Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default SubscriptionDetails;
