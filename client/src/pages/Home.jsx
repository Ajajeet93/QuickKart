import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { ChevronRight, Filter, ChevronDown, Sparkles, Clock, ArrowRight, Apple, Carrot, Cherry } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector((state) => state.products);
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        dispatch(fetchProducts(categoryFilter));
    }, [dispatch, categoryFilter]);

    // Mock Categories for "Shelf" view
    const categories = [
        { id: 'vegetables', name: 'Vegetables', img: 'https://cdn-icons-png.flaticon.com/512/2329/2329903.png', color: 'bg-green-100' },
        { id: 'fruits', name: 'Fruits', img: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png', color: 'bg-red-100' },
        { id: 'dairy', name: 'Dairy', img: 'https://cdn-icons-png.flaticon.com/512/869/869664.png', color: 'bg-blue-100' },
        { id: 'meat', name: 'Meat', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046769.png', color: 'bg-orange-100' },
        { id: 'bakery', name: 'Bakery', img: 'https://cdn-icons-png.flaticon.com/512/992/992747.png', color: 'bg-yellow-100' },
        { id: 'beverages', name: 'Beverages', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', color: 'bg-purple-100' },
        { id: 'snacks', name: 'Snacks', img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', color: 'bg-pink-100' },
        { id: 'instant-food', name: 'Instant Food', img: 'https://cdn-icons-png.flaticon.com/512/3480/3480823.png', color: 'bg-indigo-100' },
        { id: 'personal-care', name: 'Personal Care', img: 'https://cdn-icons-png.flaticon.com/512/2640/2640523.png', color: 'bg-teal-100' },
        { id: 'household', name: 'Household', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', color: 'bg-gray-100' },
    ];

    const filteredItems = searchTerm
        ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : categoryFilter ? items.filter(item => item.category === categoryFilter) : items;

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (error) return <div className="min-h-screen pt-32 text-center text-red-500">Error: {error}</div>;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pt-[100px]">
            {/* Hero Section */}
            {!searchTerm && !categoryFilter && (
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-[40px] p-8 md:p-12 lg:p-16 relative overflow-hidden text-center md:text-left"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-green-200/30 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-yellow-200/30 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm"
                                >
                                    <Clock size={16} className="text-green-600" />
                                    <span>Delivered in 10 minutes</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight"
                                >
                                    Groceries in <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">minutes</span>, not hours.
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg text-gray-600 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed"
                                >
                                    Get fresh produce, dairy, and daily essentials delivered to your doorstep at lightning speed. No minimum order.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
                                >
                                    <Link to="/products" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                                        Shop Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] overflow-hidden">
                                                    <img src={`https://randomuser.me/api/portraits/thumb/men/${20 + i}.jpg`} alt="User" />
                                                </div>
                                            ))}
                                        </div>
                                        <span>10k+ happy customers</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Visuals */}
                            <div className="relative hidden md:block h-[400px] lg:h-[500px]">
                                {/* Main Hero Image */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                    className="absolute inset-0 flex items-center justify-center z-10"
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
                                        className="w-[90%] h-[90%] object-cover object-center rounded-[3rem] shadow-2xl rotate-3 mask-image"
                                        style={{ maskImage: 'linear-gradient(black 80%, transparent 100%)' }}
                                        alt="Grocery Bag"
                                    />
                                    {/* Glass Overlay Card */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute bottom-10 left-0 bg-white/90 backdrop-blur shadow-2xl p-4 rounded-2xl flex items-center gap-4 max-w-[200px]"
                                    >
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">Fresh</p>
                                            <p className="font-black text-gray-900">100% Organic</p>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute top-10 right-10 z-20 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <Apple className="text-red-500" size={32} />
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                                    className="absolute bottom-20 right-0 z-20 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <Carrot className="text-orange-500" size={28} />
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                    className="absolute top-1/2 left-0 z-20 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <Cherry className="text-rose-600" size={24} />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Categories Shelf */}
            {!searchTerm && !categoryFilter && (
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                    </div>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6"
                    >
                        {/* Static "All Products" Link */}
                        <Link to="/products" className="flex flex-col items-center gap-3 cursor-pointer group">
                            <motion.div variants={itemVariants}>
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-900 rounded-[2rem] flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border border-transparent group-hover:border-gray-700">
                                    <div className="text-white font-bold text-xs md:text-sm uppercase tracking-wider text-center px-2">All Products</div>
                                </div>
                                <span className="font-bold text-gray-800 text-xs md:text-sm mt-3 block text-center">View All</span>
                            </motion.div>
                        </Link>

                        {categories.map((cat) => (
                            <Link to={`/products?category=${cat.name}`} key={cat.id} className="flex flex-col items-center gap-3 cursor-pointer group">
                                <motion.div variants={itemVariants}>
                                    <div className={`w-24 h-24 md:w-32 md:h-32 ${cat.color} rounded-[2rem] flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border border-transparent group-hover:border-primary/20`}>
                                        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl">
                                            {/* Using emoji as fallback if img fails, or just img if available */}
                                            <img src={cat.img} alt={cat.name} className="w-full h-full object-contain drop-shadow-sm" />
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-800 text-xs md:text-sm mt-3 block text-center">{cat.name}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Product Grid */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {searchTerm ? `Results for "${searchTerm}"` : categoryFilter ? `${categoryFilter}` : 'Recommended for You'}
                    </h2>
                    {/* Sort/Filter - Removed per request */}
                    <div></div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">No products found.</p>
                        <button onClick={() => window.location.href = '/'} className="mt-4 text-primary font-bold hover:underline">View All</button>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {filteredItems.slice(0, 10).map((product) => (
                            <motion.div key={product._id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Home;
