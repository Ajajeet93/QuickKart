import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '', color: '#ffffff', image: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/categories');
            setCategories(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/api/categories/${editingCategory._id}`, formData);
            } else {
                await api.post('/api/categories', formData);
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/api/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category');
            }
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, icon: category.icon, color: category.color, image: category.image || '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: '', color: '#ffffff', image: '' });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Categories</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-500">Name</th>
                            <th className="text-left p-4 font-medium text-gray-500">Image</th>
                            <th className="text-left p-4 font-medium text-gray-500">Icon</th>
                            <th className="text-left p-4 font-medium text-gray-500">Color</th>
                            <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 font-medium">{category.name}</td>
                                <td className="p-4">
                                    {category.image ? (
                                        <img src={category.image} alt={category.name} className="w-8 h-8 object-contain" />
                                    ) : (
                                        <span className="text-gray-300 text-xs">No img</span>
                                    )}
                                </td>
                                <td className="p-4">{category.icon}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded-full border"
                                            style={{ backgroundColor: category.color }}
                                        ></div>
                                        <span className="text-gray-500 text-sm">{category.color}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color (Hex)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-10 w-10 border rounded cursor-pointer"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none uppercase"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
