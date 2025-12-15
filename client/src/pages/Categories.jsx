import React, { useState, useEffect } from 'react';
import API_URL from '../config';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/api/categories`);
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <div className="text-center py-32">Loading Categories...</div>;

    return (
        <div className="pt-24 md:pt-32 min-h-screen bg-gray-50/50">
            <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Explore Categories</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">Browse our wide selection of fresh produce, meats, dairy, and more. Sourced daily for the best quality.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {categories.map((cat) => (
                        <div key={cat._id} className={`group relative p-8 rounded-3xl ${cat.color} bg-opacity-30 hover:bg-opacity-100 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-current/10 flex flex-col items-center text-center cursor-pointer`}>
                            <div className="text-6xl mb-6 filter drop-shadow-md transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{cat.name}</h3>
                            <span className="text-sm font-semibold opacity-70 group-hover:opacity-100 transition-opacity">Browse Products &rarr;</span>
                            <a href={`/category/${cat.name.toLowerCase()}`} className="absolute inset-0 z-10" aria-label={`Browse ${cat.name}`}></a>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CategoriesPage;
