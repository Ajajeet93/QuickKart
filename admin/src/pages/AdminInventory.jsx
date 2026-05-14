import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { AlertTriangle, Package, TrendingDown, CheckCircle, RefreshCw, Search, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StockBar = ({ stock, max = 200 }) => {
    const pct = Math.min((stock / max) * 100, 100);
    const color = stock > 20 ? '#10b981' : stock > 0 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-bold w-6 text-right" style={{ color }}>{stock}</span>
        </div>
    );
};

const KPI = ({ icon: Icon, label, value, color, sub }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const TABS = ['all', 'low', 'out'];
const TAB_LABEL = { all: 'All Products', low: 'Low Stock (≤10)', out: 'Out of Stock' };

const AdminInventory = () => {
    const [products,   setProducts]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab,        setTab]        = useState('all');
    const [search,     setSearch]     = useState('');
    const [editing,    setEditing]    = useState(null); // { id, stock }
    const [saving,     setSaving]     = useState(null);

    const fetchProducts = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('/api/v1/products?limit=1000');
            setProducts(res.data.products || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => {
        fetchProducts();
        const interval = setInterval(() => fetchProducts(), 30_000); // auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleRestock = async (id) => {
        if (!editing || editing.id !== id) return;
        setSaving(id);
        try {
            await api.put(`/api/v1/products/${id}`, { stock: parseInt(editing.stock) });
            fetchProducts();
            setEditing(null);
        } catch (e) { alert('Failed to update stock.'); }
        finally { setSaving(null); }
    };

    const sorted = useMemo(() =>
        [...products].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    , [products]);

    const filtered = useMemo(() => sorted.filter(p => {
        const ms = p.name.toLowerCase().includes(search.toLowerCase());
        if (tab === 'low')  return ms && p.stock <= 10 && p.stock > 0;
        if (tab === 'out')  return ms && p.stock === 0;
        return ms;
    }), [sorted, search, tab]);

    const kpis = useMemo(() => ({
        total:   products.length,
        healthy: products.filter(p => p.stock > 20).length,
        low:     products.filter(p => p.stock <= 10 && p.stock > 0).length,
        out:     products.filter(p => p.stock === 0).length,
    }), [products]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Inventory</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Monitor stock levels and restock products inline</p>
                </div>
                <button onClick={() => fetchProducts(true)}
                    className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-colors ${refreshing ? 'opacity-60' : ''}`}>
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI icon={Package}      label="Total Products" value={kpis.total}   color="bg-blue-500" />
                <KPI icon={CheckCircle}  label="Healthy Stock"  value={kpis.healthy} color="bg-emerald-500" sub="> 20 units" />
                <KPI icon={AlertTriangle} label="Low Stock"     value={kpis.low}     color="bg-amber-500" sub="≤ 10 units" />
                <KPI icon={TrendingDown} label="Out of Stock"   value={kpis.out}     color="bg-red-500"   sub="0 units left" />
            </div>

            {/* Alert banner */}
            {(kpis.low > 0 || kpis.out > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        {kpis.out > 0 && <><strong>{kpis.out}</strong> product{kpis.out > 1 ? 's' : ''} out of stock · </>}
                        {kpis.low > 0 && <><strong>{kpis.low}</strong> product{kpis.low > 1 ? 's' : ''} below reorder threshold (≤10 units).</>}
                        {' '}Restock immediately to avoid lost sales.
                    </p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search products…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all" />
                    </div>
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                                    ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {TAB_LABEL[t]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stock Level</th>
                                <th className="text-left px-4 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Quick Restock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="py-16 text-center text-gray-400">
                                    <Package size={36} className="mx-auto mb-3 text-gray-200" />
                                    <p className="font-semibold">No products found</p>
                                </td></tr>
                            ) : filtered.map(p => {
                                const stock = p.stock ?? 0;
                                const isEditing = editing?.id === p._id;
                                const statusColor = stock > 20 ? 'bg-emerald-100 text-emerald-700' : stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                                const statusLabel = stock > 20 ? 'Healthy' : stock > 0 ? 'Low Stock' : 'Out of Stock';
                                return (
                                    <tr key={p._id} className={`hover:bg-gray-50/60 transition-colors ${stock === 0 ? 'bg-red-50/30' : stock <= 10 ? 'bg-amber-50/20' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                    {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                                                    <p className="text-xs text-gray-400">₹{p.price}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                {p.categoryId?.name || p.category || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 w-48">
                                            <StockBar stock={stock} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <input type="number" min="0" autoFocus
                                                            className="w-20 border border-emerald-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-400 outline-none text-center"
                                                            value={editing.stock}
                                                            onChange={e => setEditing({ ...editing, stock: e.target.value })}
                                                            onKeyDown={e => { if (e.key === 'Enter') handleRestock(p._id); if (e.key === 'Escape') setEditing(null); }} />
                                                        <button onClick={() => handleRestock(p._id)} disabled={saving === p._id}
                                                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60">
                                                            {saving === p._id ? '…' : 'Save'}
                                                        </button>
                                                        <button onClick={() => setEditing(null)}
                                                            className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => setEditing({ id: p._id, stock: stock })}
                                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                                                        <Edit2 size={12} /> Restock
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
