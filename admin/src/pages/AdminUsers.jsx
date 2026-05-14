import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, UserPlus, X, Save, Eye, ShoppingBag, DollarSign, Package, Search } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        role: 'user',
        phone: ''
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [orderSearchQuery, setOrderSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(() => fetchUsers(), 30_000); // auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/v1/admin/users');
            setUsers(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/api/v1/admin/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const handleViewUser = async (id) => {
        setShowDetailsModal(true);
        setLoadingDetails(true);
        try {
            const res = await api.get(`/api/v1/admin/users/${id}`);
            setSelectedUser(res.data.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            alert('Failed to load user details');
            setShowDetailsModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/admin/users', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'user', phone: '' });
            fetchUsers();
            alert('User created successfully');
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Users Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                    <UserPlus size={20} />
                    Add New User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-500">Name</th>
                            <th className="text-left p-4 font-medium text-gray-500">Email</th>
                            <th className="text-left p-4 font-medium text-gray-500">Role</th>
                            <th className="text-left p-4 font-medium text-gray-500">Joined</th>
                            <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleViewUser(user._id)}
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Create New User</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Details Slide-over */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div 
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
                        onClick={() => { setShowDetailsModal(false); setSelectedUser(null); setOrderSearchQuery(''); }}
                    />
                    <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0 z-10">
                            <h3 className="font-bold text-lg">User Profile & Order History</h3>
                            <button onClick={() => { setShowDetailsModal(false); setSelectedUser(null); setOrderSearchQuery(''); }} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            {loadingDetails || !selectedUser ? (
                                <div className="flex justify-center items-center py-10 h-full">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="space-y-6 pb-8">
                                    {/* Profile Info */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center gap-5">
                                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold">
                                            {selectedUser.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900">{selectedUser.user.name}</h4>
                                            <p className="text-gray-500">{selectedUser.user.email}</p>
                                            {selectedUser.user.phone && <p className="text-gray-500 text-sm mt-1">{selectedUser.user.phone}</p>}
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedUser.user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                                                {selectedUser.user.role}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-2">Joined {new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Total Orders</p>
                                                <p className="text-xl font-extrabold text-gray-900">{selectedUser.totalOrders}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Money Spent</p>
                                                <p className="text-xl font-extrabold text-gray-900">₹{selectedUser.totalSpent.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order History */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Package size={18} /> Order History
                                            </h4>
                                            {selectedUser.orders.length > 0 && (
                                                <div className="relative w-48">
                                                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search Order ID..." 
                                                        value={orderSearchQuery}
                                                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {(() => {
                                            if (selectedUser.orders.length === 0) {
                                                return (
                                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                        <p className="text-gray-500 text-sm">No orders placed yet.</p>
                                                    </div>
                                                );
                                            }

                                            const filteredOrders = selectedUser.orders.filter(order => 
                                                order._id.toLowerCase().includes(orderSearchQuery.toLowerCase())
                                            );

                                            if (filteredOrders.length === 0) {
                                                return (
                                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                        <p className="text-gray-500 text-sm">No matching orders found.</p>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="space-y-3">
                                                    {filteredOrders.map(order => (
                                                        <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-white flex justify-between items-center">
                                                            <div>
                                                                <p className="font-bold text-sm">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                                                <p className="text-xs text-gray-600 mt-1">{order.items.length} item{order.items.length !== 1 && 's'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-extrabold text-gray-900 mb-1">₹{order.totalAmount.toFixed(2)}</p>
                                                                <div className="flex gap-2 justify-end">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                    }`}>{order.status}</span>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                                        order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                                        order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                                                                        'bg-amber-100 text-amber-700'
                                                                    }`}>{order.paymentStatus}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
