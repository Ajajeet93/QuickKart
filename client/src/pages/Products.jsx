import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchProducts } from '../store/productSlice';
import ProductCard from '../components/ProductCard'; // RESTORED
import ProductSkeleton from '../components/ProductSkeleton';
import { ShoppingBag } from 'lucide-react';
import API_URL from '../config';
// import { addToCart } from '../store/cartSlice'; // Kept commented out for now

const Products = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryId = searchParams.get('categoryId');
    const categoryName = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    // Access Redux state
    const { items: products, loading, error, hasMore, page, total } = useSelector((state) => state.products);
    const [categories, setCategories] = useState([]);

    // Local sort state
    const [sortOption, setSortOption] = useState('recommended');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Initial load and filter change
    useEffect(() => {
        // Reset to page 1 when filters change
        dispatch(fetchProducts({ categoryId, category: categoryName, search: searchQuery, page: 1, limit: 12 }));
    }, [dispatch, categoryId, categoryName, searchQuery]);

    // Optimize Load More
    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            dispatch(fetchProducts({
                categoryId,
                category: categoryName,
                search: searchQuery,
                page: page + 1,
                limit: 12
            }));
        }
    }, [dispatch, loading, hasMore, categoryId, categoryName, searchQuery, page]);

    // Memoize Sorting Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];
        switch (sortOption) {
            case 'price-low-high':
                return result.sort((a, b) => a.price - b.price);
            case 'price-high-low':
                return result.sort((a, b) => b.price - a.price);
            case 'name-a-z':
                return result.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return result;
        }
    }, [products, sortOption]);

    const handleSortSelect = useCallback((option) => {
        setSortOption(option);
        setIsSortOpen(false);
    }, []);

    const getSortLabel = useMemo(() => {
        switch (sortOption) {
            case 'price-low-high': return 'Price: Low to High';
            case 'price-high-low': return 'Price: High to Low';
            case 'name-a-z': return 'Name: A to Z';
            default: return 'Recommended';
        }
    }, [sortOption]);

    // Fetch categories
    useEffect(() => {
        const fetchCats = async () => {
            try {
                // Determine API URL based on environment or default
                const url = `${API_URL}/api/categories`;
                const res = await fetch(url);
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCats();
    }, []);

    const handleCategoryClick = useCallback((id) => {
        if (id) {
            setSearchParams({ categoryId: id });
        } else {
            setSearchParams({});
        }
    }, [setSearchParams]);

    // Loading State - Only show full skeleton on initial load of new category/search
    // If loading is true but we have products (Load More), don't unmount list
    const isInitialLoading = loading && products.length === 0;

    if (error) return <div className="min-h-screen pt-32 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-12 bg-gray-50 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap pb-4 mb-8 gap-3">
                <button
                    onClick={() => handleCategoryClick(null)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${!categoryId && !categoryName && !searchQuery ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                    All Products
                </button>
                {categories.map((cat) => {
                    const isActive = categoryId === cat._id || (categoryName && categoryName.toLowerCase() === cat.name.toLowerCase());
                    return (
                        <button
                            key={cat._id}
                            onClick={() => handleCategoryClick(cat._id)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-primary text-white shadow-lg shadow-green-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between items-end mb-8 relative">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {searchQuery
                            ? `Results for "${searchQuery}"`
                            : categoryId
                                ? categories.find(c => c._id === categoryId)?.name || 'Category Products'
                                : 'All Products'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isInitialLoading ? 'Searching...' : `${filteredProducts.length} items found`}
                    </p>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-primary transition-all font-medium"
                    >
                        <span>Sort By: <span className="text-primary">{getSortLabel}</span></span>
                        <ShoppingBag className="w-4 h-4" />
                    </button>

                    {isSortOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                            {[
                                { value: 'recommended', label: 'Recommended' },
                                { value: 'price-low-high', label: 'Price: Low to High' },
                                { value: 'price-high-low', label: 'Price: High to Low' },
                                { value: 'name-a-z', label: 'Name: A to Z' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSortSelect(opt.value)}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition ${sortOption === opt.value ? 'font-bold text-primary bg-primary/5' : 'text-gray-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {isInitialLoading ? (
                /* Skeleton Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No products found matching your criteria.
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {hasMore && !searchQuery && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:shadow-md hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                            >
                                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
                                {loading ? 'Loading...' : 'Load More Products'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Products;
