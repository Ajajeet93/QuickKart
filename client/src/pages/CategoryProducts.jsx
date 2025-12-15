import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_URL from '../config';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';

const CategoryProducts = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch products by category slug/name
                const res = await fetch(`${API_URL}/api/products?category=${slug}`);
                const data = await res.json();
                setProducts(data);

                // Capitalize slug for display title if we don't have category details handy
                setCategoryName(slug.charAt(0).toUpperCase() + slug.slice(1));
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]);

    return (
        <div className="pt-24 md:pt-32 min-h-screen">
            <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="mb-8">
                    <Link to="/categories" className="inline-flex items-center text-gray-500 hover:text-primary transition mb-4">
                        <ArrowLeft size={18} className="mr-2" /> Back to Categories
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900">{categoryName}</h1>
                    <p className="text-gray-500 mt-2">Showing {products.length} results</p>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-400">Loading products...</div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                                <div className="relative h-64 mb-4 overflow-hidden rounded-2xl bg-gray-50">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.rating > 0 && (
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-700 shadow-sm">
                                            <Star size={12} className="text-yellow-400 fill-current" />
                                            {product.rating}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wide">{product.category}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-primary transition-colors duration-300 shadow-lg shadow-gray-200">
                                            <ShoppingCart size={18} />
                                            <span className="text-sm font-bold">Add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <h3 className="text-xl font-medium text-gray-600">No products found in this category.</h3>
                        <p className="text-gray-400 mt-2">Try browsing other categories.</p>
                        <Link to="/categories" className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-green-600 transition">
                            Browse Categories
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CategoryProducts;
