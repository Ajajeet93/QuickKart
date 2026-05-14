import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Edit2, Trash2, Star, AlertTriangle, Package, Sparkles, Layers, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductModal from '../components/ProductModal';

/* ── Confirmation Dialog ──────────────────────────────────────── */
const ConfirmDialog = ({ title, message, confirmLabel='Delete', danger=true, onConfirm, onCancel }) => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
        style={{backdropFilter:'blur(4px)'}}>
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger?'bg-red-100':'bg-blue-100'}`}>
                {danger ? <Trash2 size={22} className="text-red-600"/> : <Edit2 size={22} className="text-blue-600"/>}
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 text-center">{title}</h3>
            <p className="text-sm text-gray-500 text-center mt-2 mb-6">{message}</p>
            <div className="flex gap-3">
                <button onClick={onCancel}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm}
                    className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors
                        ${danger?'bg-red-600 hover:bg-red-700':'bg-blue-600 hover:bg-blue-700'}`}>
                    {confirmLabel}
                </button>
            </div>
        </motion.div>
    </motion.div>
);

/* ── Toast ──────────────────────────────────────────────────────── */
const Toast = ({ msg, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }}
            className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold
                ${type==='success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {type==='success' ? '✓' : '✗'} {msg}
        </motion.div>
    );
};

/* ── Product Card ────────────────────────────────────────────────── */
const ProductCard = ({ product, categories, onEdit, onDelete, deleting }) => {
    const cat = categories.find(c => c._id === (product.categoryId?._id || product.categoryId));
    const bgColor = cat?.color || '#f3f4f6';
    const stock = product.stock ?? 0;
    const stockColor = stock > 20 ? { bg:'#dcfce7', text:'#15803d' }
                     : stock > 0  ? { bg:'#fef3c7', text:'#b45309' }
                     :              { bg:'#fee2e2', text:'#dc2626' };

    return (
        <motion.div layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300">

            {/* Image / Colour header */}
            <div className="relative h-44 flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${bgColor}ee, ${bgColor}99)` }}>
                {product.image
                    ? <img src={product.image} alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-70 group-hover:scale-105 transition-transform duration-500"/>
                    : null}

                {/* Category icon */}
                <span className="text-5xl relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {cat?.icon || '📦'}
                </span>

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
                    {product.isPopular && (
                        <span className="flex items-center gap-1 bg-amber-400 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                            <Star size={8} className="fill-white text-white"/> Popular
                        </span>
                    )}
                </div>

                {/* Stock badge top right */}
                <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-sm"
                        style={{ backgroundColor: stockColor.bg, color: stockColor.text }}>
                        {stock > 0 ? `${stock} left` : 'Out of stock'}
                        {stock <= 10 && stock > 0 && ' ⚠'}
                    </span>
                </div>

                {/* Hover action overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button onClick={() => onEdit(product)}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg hover:scale-110 transition-transform">
                        <Edit2 size={16}/>
                    </button>
                    <button onClick={() => onDelete(product._id, product.name)} disabled={deleting===product._id}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-lg hover:scale-110 transition-transform disabled:opacity-50">
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>

            {/* Card body */}
            <div className="p-4 space-y-2.5">
                <div>
                    <p className="font-extrabold text-gray-900 text-sm leading-tight truncate">{product.name}</p>
                    {cat && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                            style={{ backgroundColor: bgColor, color:'#374151' }}>
                            {cat.icon} {cat.name}
                        </span>
                    )}
                </div>

                {/* Price row */}
                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="text-xl font-extrabold text-gray-900">₹{product.price}</span>
                        {product.variants?.length > 0 && (
                            <span className="text-xs text-gray-400 ml-1.5">
                                · {product.variants.length} variant{product.variants.length>1?'s':''}
                            </span>
                        )}
                    </div>
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <Star size={12} className="fill-amber-400 text-amber-400"/>
                            <span className="text-xs font-bold text-gray-600">{product.rating}</span>
                        </div>
                    )}
                </div>

                {/* Footer chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100">
                    {product.variants?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            <Layers size={9}/> {product.variants.length} sizes
                        </span>
                    )}
                    {product.isPopular && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Sparkles size={9}/> Featured
                        </span>
                    )}
                    {product.images?.length > 0 && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            +{product.images.length} imgs
                        </span>
                    )}
                </div>
                {/* Always-visible action buttons */}
                <div className="flex gap-2 pt-2">
                    <button onClick={() => onEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition-colors">
                        <Edit2 size={13}/> Edit
                    </button>
                    <button onClick={() => onDelete(product._id, product.name)} disabled={deleting===product._id}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-colors disabled:opacity-50">
                        <Trash2 size={13}/> Delete
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
const AdminProducts = () => {
    const [products,   setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [modalOpen,  setModalOpen]  = useState(false);
    const [editing,    setEditing]    = useState(null);
    const [search,     setSearch]     = useState('');
    const [catFilter,  setCatFilter]  = useState('');
    const [stockFilter,setStockFilter]= useState('all');
    const [toast,      setToast]      = useState(null);
    const [deleting,   setDeleting]   = useState(null);
    const [confirm,    setConfirm]    = useState(null); // {id, name}

    const fetchAll = async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                api.get('/api/v1/products?limit=1000'),
                api.get('/api/v1/categories'),
            ]);
            setProducts(pRes.data.products || []);
            setCategories(cRes.data);
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSaved = (msg) => { setToast({ msg, type:'success' }); fetchAll(); };
    const openAdd    = () => { setEditing(null); setModalOpen(true); };
    const openEdit   = (p) => { setEditing(p);   setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleDelete = async () => {
        if (!confirm) return;
        const { id, name } = confirm;
        setConfirm(null);
        setDeleting(id);
        try {
            await api.delete(`/api/v1/products/${id}`);
            setToast({ msg:`"${name}" deleted.`, type:'success' });
            fetchAll();
        } catch(e) {
            setToast({ msg:'Delete failed.', type:'error' });
        } finally { setDeleting(null); }
    };

    const askDelete = (id, name) => setConfirm({ id, name });

    const filtered = products.filter(p => {
        const ms = p.name.toLowerCase().includes(search.toLowerCase());
        const mc = !catFilter || (p.categoryId?._id===catFilter || p.categoryId===catFilter);
        const mst = stockFilter==='all' ? true : stockFilter==='low' ? p.stock<=10 : stockFilter==='out' ? p.stock===0 : p.stock>10;
        return ms && mc && mst;
    });

    const lowCount = products.filter(p => p.stock<=10 && p.stock>0).length;
    const outCount = products.filter(p => p.stock===0).length;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
                <p className="text-sm font-medium">Loading products…</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Products</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {products.length} total &middot; {filtered.length} shown
                        {lowCount>0 && <span className="ml-2 text-amber-600 font-semibold">· ⚠ {lowCount} low stock</span>}
                        {outCount>0 && <span className="ml-2 text-red-600 font-semibold">· ✗ {outCount} out of stock</span>}
                    </p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20">
                    <Plus size={16}/> Add Product
                </button>
            </div>

            {/* ── Stock alert banner ── */}
            {(lowCount > 0 || outCount > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-500 flex-shrink-0"/>
                    <p className="text-sm text-red-700 font-medium">
                        {outCount > 0 && <><strong>{outCount}</strong> product{outCount>1?'s':''} out of stock · </>}
                        {lowCount > 0 && <><strong>{lowCount}</strong> product{lowCount>1?'s':''} running low</>}
                        . Restock soon to avoid lost sales.
                    </p>
                </div>
            )}

            {/* ── Filters ── */}
            <div className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Search products…" value={search}
                        onChange={e=>setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all w-52 shadow-sm"/>
                </div>
                <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all shadow-sm">
                    <option value="">All Categories</option>
                    {categories.map(c=><option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
                <select value={stockFilter} onChange={e=>setStockFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all shadow-sm">
                    <option value="all">All Stock</option>
                    <option value="healthy">In Stock</option>
                    <option value="low">Low Stock (≤10)</option>
                    <option value="out">Out of Stock</option>
                </select>
            </div>

            {/* ── Product Card Grid ── */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center gap-3">
                    <Package size={44} className="text-gray-200"/>
                    <p className="font-bold text-gray-500">No products found</p>
                    <p className="text-xs text-gray-400">Try adjusting your filters or add a new product.</p>
                    <button onClick={openAdd}
                        className="mt-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                        + Add Product
                    </button>
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <AnimatePresence>
                        {filtered.map(p => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                categories={categories}
                                onEdit={openEdit}
                                onDelete={askDelete}
                                deleting={deleting}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <ProductModal editing={editing} categories={categories} onClose={closeModal} onSaved={handleSaved}/>
                )}
            </AnimatePresence>

            {/* Confirm Delete Dialog */}
            <AnimatePresence>
                {confirm && (
                    <ConfirmDialog
                        title="Delete Product?"
                        message={`"${confirm.name}" will be permanently removed. This cannot be undone.`}
                        confirmLabel="Yes, Delete"
                        danger={true}
                        onConfirm={handleDelete}
                        onCancel={() => setConfirm(null)}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
