import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import {
    Search, Eye, Trash2, X, User, MapPin, CreditCard,
    CheckCircle, Truck, Package, AlertCircle, Clock,
    Calendar, TrendingUp, ShoppingBag, DollarSign, RefreshCw, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Helpers ─────────────────────────────────────────────────────── */
const STATUS_CFG = {
    Pending:    { color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500',   icon: Clock },
    Processing: { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500',  icon: Package },
    Shipped:    { color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500',    icon: Truck },
    Delivered:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle },
    Cancelled:  { color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500',     icon: AlertCircle },
};
const cfg = s => STATUS_CFG[s] || STATUS_CFG.Pending;

const StatusBadge = ({ status }) => {
    const { color, dot, icon: Icon } = cfg(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {status}
        </span>
    );
};

const KPI = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

/* ── Order Detail Panel ──────────────────────────────────────────── */
const OrderPanel = ({ order, onClose, onStatusChange }) => {
    const [status, setStatus] = useState(order.status);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try { await onStatusChange(order._id, status); onClose(); }
        finally { setSaving(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end"
            style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Order ID</p>
                        <h3 className="font-extrabold text-gray-900 font-mono">#{order._id.slice(-8).toUpperCase()}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status update */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(STATUS_CFG).map(s => (
                                <button key={s} type="button" onClick={() => setStatus(s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
                                        ${status === s ? cfg(s).color + ' shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        {status !== order.status && (
                            <button onClick={save} disabled={saving}
                                className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
                                {saving ? 'Saving…' : `Save — Mark as ${status}`}
                            </button>
                        )}
                    </div>

                    {/* Customer */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User size={12} /> Customer</p>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="font-bold text-gray-900">{order.userId?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{order.userId?.email}</p>
                            <p className="text-xs text-gray-400 font-mono mt-2">ID: {order.userId?._id}</p>
                        </div>
                    </div>

                    {/* Shipping */}
                    {order.shippingAddress && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={12} /> Delivery Address</p>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 space-y-0.5">
                                <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p className="text-gray-400 text-xs pt-1">📞 {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Package size={12} /> Items ({order.items.length})</p>
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            {order.items.map((item, i) => (
                                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                        {item.product?.image && <img src={item.product.image} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || <span className="text-red-400 italic">Deleted product</span>}</p>
                                        {item.variant && <p className="text-xs text-gray-400">Variant: {item.variant.weight}</p>}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">x{item.quantity} @ ₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard size={15} className="text-gray-400" />
                            <span>{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {order.paymentStatus}
                            </span>
                            <span className="text-lg font-extrabold text-gray-900">₹{order.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
    const [orders,      setOrders]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [refreshing,  setRefreshing]  = useState(false);
    const [selected,    setSelected]    = useState(null);
    const [search,      setSearch]      = useState('');
    const [tab,         setTab]         = useState('All');
    const [confirm,     setConfirm]     = useState(null);

    const fetchOrders = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('/api/v1/admin/orders');
            setOrders(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(), 30_000); // auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/api/v1/admin/orders/${id}/status`, { status });
            fetchOrders();
        } catch (e) { alert('Failed to update status'); }
    };

    const handleDelete = async () => {
        if (!confirm) return;
        try { await api.delete(`/api/v1/admin/orders/${confirm}`); fetchOrders(); }
        catch (e) { alert('Delete failed'); }
        finally { setConfirm(null); }
    };

    // KPIs
    const today = new Date().toDateString();
    const kpis = useMemo(() => ({
        total:     orders.length,
        today:     orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
        pending:   orders.filter(o => ['Pending','Processing'].includes(o.status)).length,
        revenue:   orders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + (o.totalAmount || 0), 0),
    }), [orders]);

    // Filtered
    const filtered = useMemo(() => orders.filter(o => {
        const ms = !search || o._id.toLowerCase().includes(search.toLowerCase()) ||
            (o.userId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.shippingAddress?.phone || '').includes(search);
        const mt = tab === 'All' || o.status === tab;
        return ms && mt;
    }), [orders, search, tab]);

    const tabCount = t => t === 'All' ? orders.length : orders.filter(o => o.status === t).length;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Loading orders…</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Orders</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{orders.length} total orders · {kpis.pending} need attention</p>
                </div>
                <button onClick={() => fetchOrders(true)}
                    className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors shadow-sm ${refreshing ? 'opacity-60' : ''}`}>
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI icon={ShoppingBag}  label="Total Orders"   value={kpis.total}   color="bg-blue-500" />
                <KPI icon={Calendar}     label="Today"          value={kpis.today}   color="bg-purple-500" sub="orders placed today" />
                <KPI icon={Clock}        label="Needs Action"   value={kpis.pending} color="bg-amber-500" sub="pending + processing" />
                <KPI icon={DollarSign}   label="Total Revenue"  value={`₹${kpis.revenue.toLocaleString('en-IN')}`} color="bg-emerald-500" />
            </div>

            {/* Search + Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="relative w-full sm:w-72">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by ID, name, phone…"
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all" />
                    </div>
                    <p className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-1 px-5 pt-3 pb-0 overflow-x-auto border-b border-gray-100">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all
                                ${tab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                            {t}
                            <span className={`min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-extrabold
                                ${tab === t ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {tabCount(t)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Items</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-16 text-gray-400">
                                        <ShoppingBag size={36} className="mx-auto mb-3 text-gray-200" />
                                        <p className="font-semibold">No orders found</p>
                                        <p className="text-xs mt-1">Try changing the filter or search term.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50/60 transition-colors group">
                                    <td className="px-5 py-4">
                                        <p className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                                            #{order._id.slice(-7).toUpperCase()}
                                        </p>
                                        <p className={`text-[10px] font-bold mt-1.5 ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {order.paymentStatus}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-gray-900 truncate max-w-[130px]">{order.userId?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-400 truncate">{order.shippingAddress?.phone || order.userId?.email || '—'}</p>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                                        <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex -space-x-2">
                                            {order.items.slice(0, 3).map((item, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 overflow-hidden" title={item.product?.name}>
                                                    {item.product?.image && <img src={item.product.image} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-extrabold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                        <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="relative">
                                            <select value={order.status}
                                                disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                                                onChange={e => handleStatusChange(order._id, e.target.value)}
                                                className={`appearance-none pr-6 pl-2 py-1.5 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all
                                                    ${cfg(order.status).color}
                                                    ${(order.status === 'Delivered' || order.status === 'Cancelled') ? 'cursor-not-allowed' : ''}`}>
                                                {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => setSelected(order)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => setConfirm(order._id)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Panel */}
            <AnimatePresence>
                {selected && (
                    <OrderPanel order={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
                )}
            </AnimatePresence>

            {/* Confirm Delete */}
            <AnimatePresence>
                {confirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
                        style={{ backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={22} className="text-red-600" />
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-lg">Delete Order?</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">This order will be permanently removed. This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirm(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleDelete}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                                    Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;
