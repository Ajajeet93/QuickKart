import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#0C831F','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
const STATUS_COLORS = { Pending:'#F59E0B', Processing:'#3B82F6', Shipped:'#8B5CF6', Delivered:'#0C831F', Cancelled:'#EF4444' };

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color}`}><Icon size={22} className="text-white" /></div>
        </div>
    </div>
);

const Card = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className="font-bold text-gray-800 text-sm mb-4">{title}</h3>
        {children}
    </div>
);

const TTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {p.name === 'revenue' ? `₹${Number(p.value).toLocaleString()}` : p.value}
                </p>
            ))}
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        setError(null);
        try {
            const res = await api.get('/api/v1/admin/stats');
            setData(res.data.data);
        } catch (e) {
            console.error('Stats fetch error:', e);
            setError(e.response?.data?.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 30_000); // auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading dashboard…</p>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="flex items-center justify-center h-64">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
                <p className="text-red-600 font-bold text-lg mb-2">⚠️ Dashboard Error</p>
                <p className="text-red-500 text-sm mb-4">{error || 'Unknown error occurred.'}</p>
                <button onClick={() => fetchStats(true)}
                    className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                    Retry
                </button>
            </div>
        </div>
    );

    const { stats, revenueByDay, ordersByStatus, topProducts, categoryDistribution, lowStockProducts, recentOrders } = data;

    const kpis = [
        { title:'Total Revenue', value:`₹${stats.totalRevenue.toLocaleString()}`, icon:DollarSign, color:'bg-emerald-500', sub:'Paid orders only' },
        { title:'Total Orders',  value:stats.totalOrders.toLocaleString(),        icon:ShoppingBag, color:'bg-blue-500',    sub:'All time' },
        { title:'Total Users',   value:stats.totalUsers.toLocaleString(),          icon:Users,       color:'bg-violet-500',  sub:'Registered customers' },
        { title:'Total Products',value:(stats.totalProducts||0).toLocaleString(),  icon:Package,     color:'bg-orange-400',  sub:'In catalogue' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">Real-time analytics for QuickKart</p>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE · 30s
                        </span>
                    </div>
                </div>
                <button onClick={() => fetchStats(true)} disabled={refreshing}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 bg-white border border-gray-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all">
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Low-Stock Banner */}
            {lowStockProducts?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={17} className="text-red-500" />
                        <span className="font-bold text-red-700 text-sm">
                            ⚠️ Low Stock — {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low!
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStockProducts.map(p => (
                            <button key={p._id} onClick={() => navigate('/products')}
                                className="flex items-center gap-1.5 bg-white border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                {p.name} — {p.stock} left
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {kpis.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Revenue Trend */}
            <Card title="📈 Revenue Trend — Last 7 Days">
                <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={revenueByDay} margin={{ top:5, right:10, left:5, bottom:0 }}>
                        <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#0C831F" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0C831F" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}
                            tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                        <Tooltip content={<TTip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
                        <Area type="monotone" dataKey="revenue" name="revenue" stroke="#0C831F" strokeWidth={2.5}
                            fill="url(#revGrad)" dot={{ r:3.5, fill:'#0C831F' }} activeDot={{ r:5 }} />
                        <Area type="monotone" dataKey="orders" name="orders" stroke="#3B82F6" strokeWidth={2}
                            fill="url(#ordGrad)" dot={{ r:3, fill:'#3B82F6' }} activeDot={{ r:5 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Orders by Status + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="🛒 Orders by Status">
                    {ordersByStatus.length === 0
                        ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
                        : (
                            <ResponsiveContainer width="100%" height={210}>
                                <PieChart>
                                    <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                        paddingAngle={4} dataKey="value" nameKey="name">
                                        {ordersByStatus.map((e, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[e.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v,n) => [v, n]} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                </Card>

                <Card title="🏆 Top 5 Products Sold">
                    {topProducts.length === 0
                        ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
                        : (
                            <ResponsiveContainer width="100%" height={210}>
                                <BarChart data={topProducts} layout="vertical" margin={{ left:10, right:20, top:5, bottom:5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={130}
                                        tick={{ fontSize:11, fill:'#374151' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v.length > 18 ? v.slice(0,18)+'…' : v} />
                                    <Tooltip formatter={v => [v, 'Units Sold']} />
                                    <Bar dataKey="sold" name="Sold" radius={[0,6,6,0]}>
                                        {topProducts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                </Card>
            </div>

            {/* Category Distribution + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <Card title="🗂 Products by Category" className="lg:col-span-2">
                    {categoryDistribution.length === 0
                        ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No products yet</div>
                        : (
                            <ResponsiveContainer width="100%" height={230}>
                                <PieChart>
                                    <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                                        paddingAngle={3} dataKey="value" nameKey="name">
                                        {categoryDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v,n) => [`${v} products`, n]} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                </Card>

                <Card title="🕐 Recent Orders" className="lg:col-span-3">
                    <div className="overflow-auto max-h-60">
                        <table className="w-full text-left text-xs">
                            <thead className="text-[10px] uppercase text-gray-400 bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 rounded-l-lg">ID</th>
                                    <th className="px-3 py-2">Customer</th>
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2 rounded-r-lg">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(o => (
                                    <tr key={o._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 font-mono text-gray-400">#{o._id.slice(-6)}</td>
                                        <td className="px-3 py-2.5">
                                            {o.userId
                                                ? <div><p className="font-semibold text-gray-800">{o.userId.name}</p><p className="text-[10px] text-gray-400">{o.userId.email}</p></div>
                                                : <span className="italic text-gray-400">Guest</span>}
                                        </td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-800">₹{o.totalAmount.toLocaleString()}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                                ${o.status==='Delivered'?'bg-emerald-100 text-emerald-700':
                                                  o.status==='Cancelled'?'bg-red-100 text-red-700':
                                                  o.status==='Processing'?'bg-blue-100 text-blue-700':
                                                  o.status==='Shipped'?'bg-purple-100 text-purple-700':
                                                  'bg-yellow-100 text-yellow-700'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-400">{format(new Date(o.createdAt),'MMM d, HH:mm')}</td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr><td colSpan="5" className="px-3 py-8 text-center text-gray-400 italic">No orders yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
