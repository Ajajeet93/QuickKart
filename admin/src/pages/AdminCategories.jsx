import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2, X, Check, Tag, Package, Eye, Loader2 } from 'lucide-react';

// ── Live Preview Card ─────────────────────────────────────────────
const CategoryPreview = ({ form }) => (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm w-full">
        <div
            className="h-28 flex items-center justify-center relative"
            style={{ backgroundColor: form.color || '#f3f4f6' }}
        >
            {form.image ? (
                <img src={form.image} alt="preview" className="w-full h-full object-cover opacity-30 absolute inset-0" />
            ) : null}
            <span className="text-5xl relative z-10">{form.icon || '🛍️'}</span>
        </div>
        <div className="p-3 bg-white">
            <p className="font-bold text-gray-900 text-sm truncate">{form.name || 'Category Name'}</p>
            {form.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{form.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
                <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: form.color }} />
                <span className="text-[10px] text-gray-400 font-mono">{form.color}</span>
            </div>
        </div>
    </div>
);

// ── Colour palette presets ────────────────────────────────────────
const PRESET_COLORS = [
    '#FEF3C7','#DCFCE7','#DBEAFE','#F3E8FF','#FFE4E6',
    '#FEE2E2','#E0F2FE','#F0FDF4','#FDF4FF','#FFFBEB',
    '#ECFEFF','#F0F9FF','#FAF5FF','#FFF7ED','#F1F5F9',
];

// ── Modal ─────────────────────────────────────────────────────────
const CategoryModal = ({ editing, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name: editing?.name || '',
        icon: editing?.icon || '',
        color: editing?.color || '#DCFCE7',
        image: editing?.image || '',
        description: editing?.description || '',
        slug: editing?.slug || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // Auto-generate slug from name
    useEffect(() => {
        if (!editing) {
            set('slug', form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        }
    }, [form.name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) return setError('Category name is required.');
        if (!form.icon.trim()) return setError('Icon emoji is required.');
        if (!form.slug.trim()) return setError('Slug is required.');
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/api/v1/categories/${editing._id}`, form);
            } else {
                await api.post('/api/v1/categories', form);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Tag size={16} className="text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {editing ? 'Edit Category' : 'Add New Category'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-auto">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-auto">
                        {error && (
                            <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-xl border border-red-200">{error}</div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category Name *</label>
                            <input
                                type="text" required
                                placeholder="e.g. Fresh Vegetables"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">URL Slug *</label>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400">
                                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-xs border-r border-gray-200">/category/</span>
                                <input
                                    type="text" required
                                    placeholder="fresh-vegetables"
                                    className="flex-1 px-3 py-2.5 text-sm outline-none"
                                    value={form.slug}
                                    onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''))}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                            <textarea
                                rows={2}
                                placeholder="Brief description shown on the storefront…"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all resize-none"
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                            />
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Icon Emoji *</label>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-2xl flex-shrink-0">
                                    {form.icon || '?'}
                                </div>
                                <input
                                    type="text" required maxLength={4}
                                    placeholder="Paste emoji e.g. 🥦"
                                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                    value={form.icon}
                                    onChange={e => set('icon', e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Copy & paste any emoji from emojipedia.org</p>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Background Image URL</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                value={form.image}
                                onChange={e => set('image', e.target.value)}
                            />
                            {form.image && (
                                <img src={form.image} alt="img preview" className="mt-2 h-16 rounded-lg object-cover w-full border border-gray-200"
                                    onError={e => { e.target.style.display='none'; }} />
                            )}
                        </div>

                        {/* Colour */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Background Colour *</label>
                            <div className="flex gap-2 items-center mb-2">
                                <input type="color" className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                                    value={form.color} onChange={e => set('color', e.target.value)} />
                                <input type="text" maxLength={7}
                                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm uppercase font-mono focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                    value={form.color} onChange={e => set('color', e.target.value)} />
                            </div>
                            {/* Preset palette */}
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_COLORS.map(c => (
                                    <button key={c} type="button"
                                        onClick={() => set('color', c)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-gray-700 scale-110' : 'border-gray-200'}`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold flex items-center gap-2 transition-colors disabled:opacity-60">
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                {editing ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </form>

                    {/* Live Preview */}
                    <div className="md:w-56 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <Eye size={13} /> Live Preview
                        </div>
                        <CategoryPreview form={form} />
                        <p className="text-[10px] text-gray-400 text-center">How it appears on the storefront</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────
const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [productCounts, setProductCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/api/v1/categories'),
                api.get('/api/v1/products?limit=1000'),
            ]);
            setCategories(catRes.data);
            // Count products per category name
            const counts = {};
            (prodRes.data.products || []).forEach(p => {
                const key = p.category || 'Uncategorized';
                counts[key] = (counts[key] || 0) + 1;
            });
            setProductCounts(counts);
        } catch (e) {
            console.error('Error fetching categories:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
        setDeleting(cat._id);
        try {
            await api.delete(`/api/v1/categories/${cat._id}`);
            fetchAll();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to delete category.');
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (cat) => { setEditing(cat); setModalOpen(true); };
    const openAdd  = ()    => { setEditing(null); setModalOpen(true); };
    const closeModal = ()  => { setModalOpen(false); setEditing(null); };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading categories…</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Categories</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{categories.length} categories · manage your product catalogue structure</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <Plus size={17} /> Add Category
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
                <input
                    type="text"
                    placeholder="Search categories…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all bg-white"
                />
                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Category Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center gap-3">
                    <Tag size={40} className="text-gray-200" />
                    <p className="font-semibold text-gray-500">No categories found</p>
                    <p className="text-xs text-gray-400">Try adjusting your search or add a new category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(cat => {
                        const count = productCounts[cat.name] || 0;
                        return (
                            <div key={cat._id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                                {/* Card top with colour */}
                                <div
                                    className="h-28 flex items-center justify-center relative overflow-hidden"
                                    style={{ backgroundColor: cat.color || '#f3f4f6' }}
                                >
                                    {cat.image && (
                                        <img src={cat.image} alt={cat.name}
                                            className="absolute inset-0 w-full h-full object-cover opacity-25"
                                            onError={e => { e.target.style.display='none'; }} />
                                    )}
                                    <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-200">
                                        {cat.icon}
                                    </span>
                                </div>

                                {/* Card body */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm truncate">{cat.name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">/{cat.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0">
                                            <Package size={10} />
                                            {count}
                                        </div>
                                    </div>

                                    {cat.description && (
                                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{cat.description}</p>
                                    )}

                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                        <span className="text-[10px] text-gray-400 font-mono flex-1">{cat.color}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                        <button onClick={() => openEdit(cat)}
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors">
                                            <Edit2 size={13} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(cat)} disabled={deleting === cat._id}
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors disabled:opacity-50">
                                            {deleting === cat._id
                                                ? <Loader2 size={13} className="animate-spin" />
                                                : <Trash2 size={13} />}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <CategoryModal
                    editing={editing}
                    onClose={closeModal}
                    onSaved={fetchAll}
                />
            )}
        </div>
    );
};

export default AdminCategories;
