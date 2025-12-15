import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API_URL from '../config';
import { ShoppingCart, User, Search, MapPin, ChevronDown, Menu, X, LogOut, Package, Wallet, LayoutDashboard, Loader } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
// ... imports
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { selectAddress } from '../store/addressSlice'; // Import action
import AddressModal from './AddressModal';

const Navbar = () => {
    const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    // Get list AND selectedId
    const { list: addressList, selectedId } = useSelector((state) => state.addresses);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Close all menus on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setShowUserMenu(false);
        setShowAddressMenu(false);
        setShowSuggestions(false);
    }, [location.pathname]);

    // Derive selected address object
    const selectedAddress = addressList.find(addr => addr._id === selectedId) || addressList[0];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAddressMenu, setShowAddressMenu] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    // ...

    // ... (handleSearch, handleLogout)
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    // Debounced Search Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSuggestions(data); // { products: [], categories: [], totalProducts: 0 }
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Search suggestion error", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions({ products: [], categories: [] });
                setShowSuggestions(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    };

    return (
        <>
            {/* Main Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white shadow-soft z-50 h-[88px] flex flex-col justify-center">
                <div className="w-full px-4 md:px-6 h-full">
                    <div className="flex items-center justify-between h-full gap-4 lg:gap-8">

                        {/* 1. Left: Logo & Location */}
                        <div className="flex items-center gap-6 md:gap-8 shrink-0">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-primary tracking-tighter leading-none">QuickKart</span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase ml-0.5">Instant Delivery</span>
                                </div>
                            </Link>

                            {/* Location Pill (Desktop) - Dynamic Address Selection */}
                            <div
                                className="hidden lg:flex relative"
                                onMouseEnter={() => setShowAddressMenu(true)}
                                onMouseLeave={() => setShowAddressMenu(false)}
                            >
                                <button className="flex items-center gap-2 bg-primary p-2 pr-4 rounded-full cursor-pointer hover:bg-green-700 transition text-left">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                        <MapPin size={16} fill="currentColor" />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="font-bold text-xs text-white">Delivery in 10 mins</p>
                                        <p className="text-xs text-green-100 truncate max-w-[140px]">
                                            {selectedAddress
                                                ? `${selectedAddress.street}, ${selectedAddress.city}`
                                                : user ? 'Add Address' : 'Select Location'}
                                        </p>
                                    </div>
                                    <ChevronDown size={14} className="text-green-100" />
                                </button>

                                {/* Animated Address Dropdown */}
                                <AnimatePresence>
                                    {showAddressMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[60]"
                                        >
                                            {user ? (
                                                <>
                                                    <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Your Addresses</p>
                                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                        {addressList?.length > 0 ? (
                                                            addressList.map((addr) => (
                                                                <button
                                                                    key={addr._id}
                                                                    onClick={() => {
                                                                        dispatch(selectAddress(addr._id));
                                                                        setShowAddressMenu(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 group/item ${selectedId === addr._id ? 'bg-primary/5 text-primary' : ''}`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <p className={`text-sm font-bold ${selectedId === addr._id ? 'text-primary' : 'text-gray-800'}`}>{addr.type || 'Home'}</p>
                                                                        {selectedId === addr._id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{addr.street}, {addr.city}</p>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-500">No addresses saved.</div>
                                                        )}
                                                    </div>
                                                    <div className="p-2 mt-1 border-t border-gray-50">
                                                        <button
                                                            onClick={() => {
                                                                setIsAddressModalOpen(true);
                                                                setShowAddressMenu(false);
                                                            }}
                                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold hover:bg-primary/10 hover:text-primary transition"
                                                        >
                                                            <MapPin size={16} /> Add New Address
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-4 text-center">
                                                    <p className="text-sm text-gray-600 mb-3">Login to see your saved addresses.</p>
                                                    <Link
                                                        to="/login"
                                                        className="block w-full py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-green-600 transition"
                                                        onClick={() => setShowAddressMenu(false)}
                                                    >
                                                        Login
                                                    </Link>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />

                        {/* 2. Middle: Search Bar (Desktop/Tablet) */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-auto" ref={searchRef}>
                            <form onSubmit={handleSearch} className="w-full relative group flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search for 'milk', 'chips', 'bread'..."
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium placeholder:font-normal"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}

                                    onFocus={() => { if (suggestions.products.length > 0 || suggestions.categories.length > 0) setShowSuggestions(true); }}
                                />
                                <button type="submit" className="absolute right-2 p-2 bg-white rounded-lg text-gray-400 hover:text-primary hover:bg-gray-50 transition">
                                    {isSearching ? <Loader size={20} className="animate-spin text-primary" /> : <Search size={20} />}
                                </button>

                                {/* Search Suggestions Dropdown */}
                                <AnimatePresence>
                                    {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60]"
                                        >
                                            {/* Categories Section */}
                                            {suggestions.categories.length > 0 && (
                                                <div className="p-2 border-b border-gray-50">
                                                    <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        Categories
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap px-2">
                                                        {suggestions.categories.map((cat) => (
                                                            <Link
                                                                key={cat._id}
                                                                to={`/products?categoryId=${cat._id}`}
                                                                onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                                                                className="px-3 py-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-700 text-gray-700 rounded-lg text-sm font-bold transition flex items-center gap-2"
                                                            >
                                                                <span>{cat.icon}</span>
                                                                {cat.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Products Section */}
                                            {suggestions.products.length > 0 && (
                                                <>
                                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Products
                                                    </div>
                                                    {suggestions.products.map((item) => (
                                                        <Link
                                                            key={item._id}
                                                            to={`/product/${item._id}`}
                                                            onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                                                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 group"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 p-1 flex items-center justify-center shrink-0">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{item.name}</p>
                                                                    <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
                                                                </div>
                                                                <p className="text-xs text-gray-400">{item.category}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </>
                                            )}

                                            <button
                                                onClick={handleSearch}
                                                className="w-full text-center py-2.5 text-xs font-bold text-primary hover:bg-primary/5 transition bg-gray-50/50 border-t border-gray-100"
                                            >
                                                View all {suggestions.totalProducts || 'results'} results
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>

                        {/* 3. Right: Account & Cart */}
                        <div className="flex items-center gap-4 shrink-0">

                            {/* Auth / Account */}
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-xl transition"
                                    >
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                            {user.name ? user.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="hidden text-left xl:block">
                                            <p className="text-xs text-gray-500 font-medium">Hello,</p>
                                            <p className="text-sm font-bold text-gray-900 max-w-[80px] truncate">{user.name?.split(' ')[0] || 'User'}</p>
                                        </div>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </button>

                                    {/* Animated User Dropdown */}
                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <>
                                                <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)}></div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[70] overflow-hidden"
                                                >
                                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 mb-2">
                                                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>

                                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm font-medium">
                                                        <User size={18} /> My Profile
                                                    </Link>
                                                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm font-medium">
                                                        <Package size={18} /> My Orders
                                                    </Link>
                                                    <Link to="/subscriptions" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm font-medium">
                                                        <Package size={18} /> My Subscriptions
                                                    </Link>
                                                    <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm font-medium">
                                                        <Wallet size={18} /> My Wallet <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-auto">₹{user.walletBalance || 0}</span>
                                                    </Link>
                                                    <Link to="/support/tickets" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm font-medium">
                                                        <LayoutDashboard size={18} /> My Tickets
                                                    </Link>
                                                    <div className="h-px bg-gray-100 my-2"></div>
                                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium text-left">
                                                        <LogOut size={18} /> Log Out
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link to="/login" className="font-bold text-gray-700 hover:text-primary transition px-3 py-2 hover:bg-gray-50 rounded-xl text-sm">
                                    Login
                                </Link>
                            )}

                            {/* Cart Button */}
                            <Link to="/cart" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${totalQuantity > 0 ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                <ShoppingCart size={20} className={totalQuantity > 0 ? 'fill-current' : ''} />
                                {totalQuantity > 0 ? (
                                    <div className="flex flex-col items-start leading-none gap-0.5">
                                        <span className="text-xs font-medium opacity-90">{totalQuantity} items</span>
                                        <span className="text-sm font-bold">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <span className="font-bold hidden sm:inline">My Cart</span>
                                )}
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed top-[88px] left-0 right-0 bottom-0 z-40 bg-white overflow-y-auto md:hidden border-t border-gray-100">
                    <div className="p-4 space-y-2">
                        {/* Search in Menu */}
                        <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </form>

                        <div className="space-y-1">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/categories', label: 'Categories' },
                                { to: '/products', label: 'All Products' },
                                { to: '/about', label: 'About Us' },
                            ].map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 text-lg font-bold text-gray-900 rounded-xl hover:bg-gray-50"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-gray-100 my-4"></div>

                        {user ? (
                            <>
                                <div className="px-4 py-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Account</p>
                                    <div className="space-y-1">

                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">
                                            <User size={18} /> My Profile
                                        </Link>
                                        <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">
                                            <Package size={18} /> My Orders
                                        </Link>
                                        <Link to="/subscriptions" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">
                                            <Wallet size={18} /> Subscriptions
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl"
                                    >
                                        <LogOut size={18} /> Log Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-2xl text-center">
                                <p className="text-gray-500 mb-4">Login to view your orders and profile</p>
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30"
                                >
                                    Login / Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Search Bar (Below Nav) - Only show if menu is closed to avoid double search */}
            {!isMenuOpen && (
                <div className="md:hidden pt-[88px] px-4 pb-2 bg-white border-b border-gray-100">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            )}

        </>
    );
};

export default Navbar;
