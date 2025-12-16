import React, { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        activeNow: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/stats');
                setStats(res.data.stats);
                setRecentOrders(res.data.recentOrders);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
        { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'bg-blue-500' },
        { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-purple-500' },
        { title: 'Active Today', value: stats.activeNow.toLocaleString(), icon: Activity, color: 'bg-orange-500' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Chart Placeholder - Kept simple as requested, authentic data is prioritized */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 lg:col-span-1 flex flex-col justify-center items-center text-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <Activity size={32} className="text-blue-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Activity Overview</h3>
                    <p className="text-gray-500 text-sm px-4">Detailed analytics charts will be implemented in the next phase.</p>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 lg:col-span-2 flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">#{order._id.slice(-6)}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {order.userId ? (
                                                <div>
                                                    <p className="font-medium text-gray-900">{order.userId.name}</p>
                                                    <p className="text-xs text-gray-400">{order.userId.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Guest / Deleted</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{format(new Date(order.createdAt), 'MMM d, HH:mm')}</td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 italic">No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
