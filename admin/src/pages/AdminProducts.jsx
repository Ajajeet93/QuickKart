import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon, MinusCircle, PlusCircle, Search, Package, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import API_URL from '../config';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        categoryId: '',
        image: '',
        images: '', // Store as newline separated string for editing
        stock: '100',
        isPopular: false,
        variants: [] // Array of { weight, price }
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/products?limit=1000`);
            setProducts(res.data.products || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/categories`);
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedCategory = categories.find(c => c._id === formData.categoryId);

            // Process images from textarea
            const processedImages = formData.images
                .split('\n')
                .map(url => url.trim())
                .filter(url => url !== '');

            const payload = {
                ...formData,
                category: selectedCategory ? selectedCategory.name : 'Uncategorized',
                images: processedImages,
                variants: formData.variants.filter(v => v.weight && v.price) // Filter incomplete variants
            };

            // Fix conflict with ObjectId casting if empty string
            if (!payload.categoryId) delete payload.categoryId;

            if (editingProduct) {
                await axios.put(`${API_URL}/api/products/${editingProduct._id}`, payload, { withCredentials: true });
            } else {
                await axios.post(`${API_URL}/api/products`, payload, { withCredentials: true });
            }
            fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/api/products/${id}`, { withCredentials: true });
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            categoryId: product.categoryId?._id || product.categoryId || '',
            image: product.image || '',
            images: product.images ? product.images.join('\n') : '',
            stock: product.stock || 0,
            isPopular: product.isPopular || false,
            variants: product.variants || []
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            categoryId: '',
            image: '',
            images: '',
            stock: '100',
            isPopular: false,
            variants: []
        });
    };

    // Variant handling
    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { weight: '', price: '' }]
        });
    };

    const removeVariant = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    if (loading) return <div>Loading...</div>;

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Products</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-500">Product</th>
                            <th className="text-left p-4 font-medium text-gray-500">Category</th>
                            <th className="text-left p-4 font-medium text-gray-500">Price</th>
                            <th className="text-left p-4 font-medium text-gray-500">Stock</th>
                            <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {product.categoryId?.name || product.category}
                                </td>
                                <td className="p-4 font-medium text-gray-900">
                                    ₹{product.price}
                                    {product.variants?.length > 0 && <span className="text-xs text-gray-400 ml-1">({product.variants.length} variants)</span>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {product.stock} in stock
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new product listing.</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <form id="productForm" onSubmit={handleSubmit} className="space-y-8">

                                    {/* Section 1: Basic Information */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <Package size={16} />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Basic Information</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Organic Bananas"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                                <div className="relative">
                                                    <textarea
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none min-h-[100px] resize-y"
                                                        placeholder="Describe your product..."
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                                <div className="relative">
                                                    <select
                                                        required
                                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none appearance-none"
                                                        value={formData.categoryId}
                                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((c) => (
                                                            <option key={c._id} value={c._id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                        <Tag size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Level</label>
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                                    <input
                                                        type="number"
                                                        required
                                                        placeholder="0.00"
                                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-end pb-3">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`
                                                    w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
                                                    ${formData.isPopular ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'}
                                                `}>
                                                        {formData.isPopular && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.isPopular}
                                                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Mark as "Popular" Item</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 w-full" />

                                    {/* Section 2: Media */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <ImageIcon size={16} />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Product Images</h4>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Image URL</label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                                        value={formData.image}
                                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    />
                                                    {formData.image && (
                                                        <div className="h-12 w-12 rounded-lg border border-gray-200 p-1 flex-shrink-0">
                                                            <img src={formData.image} alt="Preview" className="h-full w-full object-cover rounded-md" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Additional Images
                                                    <span className="text-gray-400 font-normal ml-2">(One URL per line)</span>
                                                </label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-mono text-sm min-h-[100px]"
                                                    placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
                                                    value={formData.images}
                                                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 w-full" />

                                    {/* Section 3: Variants */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                    <Tag size={16} />
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">Variants</h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addVariant}
                                                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium text-sm flex items-center gap-2 transition-colors"
                                            >
                                                <Plus size={16} />
                                                Add Variant
                                            </button>
                                        </div>

                                        {formData.variants.length === 0 ? (
                                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                                                <p className="text-gray-500 font-medium">No variants added yet.</p>
                                                <p className="text-sm text-gray-400 mt-1">Create variants for different sizes or weights (e.g., 500g vs 1kg).</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    <div className="col-span-6">Weight / Size</div>
                                                    <div className="col-span-5">Additional Price</div>
                                                    <div className="col-span-1 text-center">Action</div>
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                    {formData.variants.map((variant, index) => (
                                                        <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                                                            <div className="col-span-6">
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. 500g"
                                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                                                                    value={variant.weight}
                                                                    onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="col-span-5 relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                                                                    value={variant.price}
                                                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="col-span-1 flex justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeVariant(index)}
                                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </form>
                            </div>

                            {/* Modal Footer - Sticky */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                                >
                                    <Check size={18} strokeWidth={2.5} />
                                    {editingProduct ? 'Update Product' : 'Save Product'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
