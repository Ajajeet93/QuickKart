import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import {
    User, Mail, Phone, Package, LogOut, MapPin,
    CreditCard, Calendar, ChevronRight, Wallet, ShoppingBag, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, loadUser } from '../store/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
    const { user: reduxUser } = useSelector((state) => state.auth);
    const [user, setUser] = useState(reduxUser);
    const [orders, setOrders] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '' });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            if (res.ok) {
                // 1. Update local state immediately for responsiveness
                setUser(data.user);
                setIsEditing(false);

                // 2. Sync Redux global state
                dispatch(loadUser());

                // 3. FORCE DB FETCH (User Request: "use db to do it")
                // This ensures we are showing exactly what is in the DB
                await fetchUserData();

                toast.success('Profile updated successfully!');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            toast.error(`Error: ${err.message}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            // Fetch User Details from DB
            const userRes = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include'
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
            }

            // Fetch Recent Orders
            const ordersRes = await fetch(`${API_URL}/api/orders/my`, {
                credentials: 'include'
            });
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData);
            }

            // Fetch Active Subscriptions
            const subRes = await fetch(`${API_URL}/api/subscriptions`, {
                credentials: 'include'
            });
            if (subRes.ok) {
                const subData = await subRes.json();
                setSubscriptions(subData);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // Sync local state when Redux user updates (e.g. after loadUser)
    useEffect(() => {
        if (reduxUser) {
            setUser(reduxUser);
        }
    }, [reduxUser]);


    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) return null;

    // Derived Data
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2025';
    const recentOrders = orders.slice(0, 2); // Top 2 recent

    // Calculate Active Subscribed Items (Count total items in active subscriptions)
    const activeSubscriptionsCount = subscriptions
        .filter(sub => sub.status === 'Active')
        .reduce((total, sub) => total + sub.items.length, 0);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header / Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <Package size={400} />
                </div>
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-xl">
                        {initials}
                    </div>
                    {/* Welcome Text */}
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p className="text-emerald-100 flex items-center justify-center md:justify-start gap-2 text-lg">
                            <Calendar size={18} /> Member since {memberSince}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Float */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Wallet */}
                    <Link to="/wallet" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Wallet Balance</p>
                            <p className="text-2xl font-bold text-gray-900">₹{user.walletBalance || 0}</p>
                        </div>
                    </Link>

                    {/* Total Orders */}
                    <Link to="/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                        </div>
                    </Link>

                    {/* Subscriptions */}
                    <Link to="/subscriptions" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Subscribed Items</p>
                            <p className="text-2xl font-bold text-gray-900">{activeSubscriptionsCount}</p>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Personal Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Profile Details</h3>
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            // Cancel
                                            setIsEditing(false);
                                            setEditData({ name: user.name, phone: user.phone || '' });
                                        } else {
                                            // Start Editing
                                            setIsEditing(true);
                                            setEditData({ name: user.name, phone: user.phone || '' });
                                        }
                                    }}
                                    className="text-sm text-emerald-600 font-bold hover:underline"
                                >
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Email Address (Read-only)</label>
                                        <div className="w-full p-2 rounded-lg bg-gray-100 text-gray-500 border border-transparent">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="Enter mobile number"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                                    >
                                        {updateLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-gray-400"><User size={20} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Full Name</p>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-gray-400"><Mail size={20} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Email Address</p>
                                            <p className="font-medium text-gray-900 break-all">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-gray-400"><Phone size={20} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Mobile Number</p>
                                            <p className="font-medium text-gray-900">{user.phone || 'Not added'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                dispatch(logoutUser());
                                navigate('/');
                            }}
                            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </div>

                    {/* Right Column: Activity */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Recent Orders Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                <Link to="/orders" className="text-sm text-emerald-600 font-bold flex items-center hover:translate-x-1 transition-transform">
                                    View All Orders <ChevronRight size={16} />
                                </Link>
                            </div>

                            {recentOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {recentOrders.map(order => (
                                        <Link
                                            key={order._id}
                                            to={`/orders/${order._id}`}
                                            className="block p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group bg-gray-50/30"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                            {order.status === 'Processing' ? 'Packing Order' :
                                                                order.status === 'Shipped' ? 'On the Way' :
                                                                    order.status}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Items
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{order.paymentStatus}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No orders yet</p>
                                    <Link to="/" className="text-emerald-600 font-bold mt-2 inline-block">Start Shopping</Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Link to="/addresses" className="p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin className="text-purple-500 group-hover:scale-110 transition-transform" size={20} />
                                    <h4 className="font-bold text-gray-900">Saved Addresses</h4>
                                </div>
                                <p className="text-sm text-gray-500">Manage your delivery locations</p>
                            </Link>
                            <Link to="/wallet" className="p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <CreditCard className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                                    <h4 className="font-bold text-gray-900">Payment Methods</h4>
                                </div>
                                <p className="text-sm text-gray-500">Manage cards and wallets</p>
                            </Link>
                            <Link to="/support/tickets" className="p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-blue-500 group-hover:scale-110 transition-transform">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Support Tickets</h4>
                                </div>
                                <p className="text-sm text-gray-500">Track returns & issues</p>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
