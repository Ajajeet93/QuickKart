import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import {
    MapPin, CreditCard, ArrowRight, Plus, ChevronDown, Check, Home, Briefcase,
    Pencil, Trash2, Wallet, Smartphone, ShieldCheck, Truck, Lock, Info, ChevronRight,
    Package, Clock, ArrowLeft
} from 'lucide-react';
import AddressModal from '../components/AddressModal';
import CardModal from '../components/CardModal';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CustomCalendar from '../components/CustomCalendar';

const Checkout = () => {
    const { items, totalAmount } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const { list: addressList } = useSelector((state) => state.addresses);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedAddress, setSelectedAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState('');
    const [upiVpa, setUpiVpa] = useState('');
    const [upiMode, setUpiMode] = useState('id'); // 'id' or 'qr'
    const [showCardModal, setShowCardModal] = useState(false);

    // Subscription State
    const [isSubscription, setIsSubscription] = useState(false);
    const [frequency, setFrequency] = useState('monthly');
    // Default start date to tomorrow as per user preference ("start from next day")
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);

    // Steps for visual progress
    const steps = [
        { number: 1, title: 'Cart', status: 'completed' },
        { number: 2, title: 'Delivery', status: 'active' },
        { number: 3, title: 'Payment', status: paymentMethod ? 'active' : 'pending' }
    ];

    const finalTotal = isSubscription ? totalAmount * 0.85 : totalAmount;

    // Auto-select first address
    useEffect(() => {
        if (addressList && addressList.length > 0 && !selectedAddress) {
            setSelectedAddress(addressList[0]._id);
        }
    }, [addressList, selectedAddress]);

    // Force Wallet payment for Subscription
    useEffect(() => {
        if (isSubscription) {
            setPaymentMethod('wallet');
        }
    }, [isSubscription]);

    // Fetch Saved Cards
    const fetchCards = async () => {
        try {
            const res = await fetch(`${API_URL}/api/wallet/cards`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setCards(data);
                // Don't auto-select here to avoid overriding user choice if they are just adding a card
                // But if it's the first card, maybe auto select?
                if (data.length > 0 && !selectedCard) setSelectedCard(data[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch cards", err);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    // Conflict Modal State
    const [conflictData, setConflictData] = useState(null);

    const handlePlaceOrder = async (forceMerge = false) => {
        if (!selectedAddress) return alert('Please select a delivery address');
        if (!paymentMethod) return alert('Please select a payment method');
        if (paymentMethod === 'upi' && !upiVpa.includes('@')) return alert('Please enter a valid UPI ID (e.g. user@bank)');

        setLoading(true);

        try {
            // Construct Payment Method String for Backend
            let effectivePaymentMethod = 'Credit Card'; // Default fallback
            if (paymentMethod === 'wallet') effectivePaymentMethod = 'Wallet';
            else if (paymentMethod === 'upi') effectivePaymentMethod = `UPI (${upiVpa})`;
            else if (paymentMethod === 'cod') effectivePaymentMethod = 'Cash on Delivery';
            else if (paymentMethod === 'card') {
                const card = cards.find(c => c._id === selectedCard);
                effectivePaymentMethod = card ? `Card ending ${card.last4}` : 'Credit Card';
            }

            let url = `${API_URL}/api/orders`;
            let body = {
                items: items.map(i => ({ product: i._id, quantity: i.quantity, price: i.price })),
                totalAmount: finalTotal,
                shippingAddressId: selectedAddress,
                paymentMethod: effectivePaymentMethod
            };

            if (isSubscription) {
                url = `${API_URL}/api/subscriptions`;
                body = {
                    items: items.map(i => ({ product: i._id, quantity: i.quantity })),
                    frequency,
                    deliveryAddressId: selectedAddress,
                    startDate: startDate || new Date().toISOString().split('T')[0],
                    forceMerge,
                    paymentMethod: effectivePaymentMethod
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.status === 409 && data.conflicts) {
                setConflictData(data.conflicts);
                setLoading(false);
                return;
            }

            if (response.ok) {
                dispatch(loadUser());
                const orderId = isSubscription ? data.orderId : data._id;
                const typeParam = isSubscription ? '&type=subscription' : '';
                navigate(`/payment-success?orderId=${orderId}${typeParam}`);
            } else {
                alert(data.message || 'Failed to process request');
                navigate('/payment-failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error processing request');
            navigate('/payment-failed');
        } finally {
            if (!conflictData) setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <Truck size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Add some fresh items to get started!</p>
                <Link to="/" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-24 md:pt-32">
            {/* Conflict Resolution Modal */}
            <AnimatePresence>
                {conflictData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-4 text-orange-600">
                                <div className="p-2 bg-orange-100 rounded-full"><ShieldCheck size={24} /></div>
                                <h3 className="text-xl font-bold">Subscription Review</h3>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                You already have active <strong>{frequency}</strong> subscriptions for these items. Integrating them will combine deliveries.
                            </p>
                            <ul className="bg-orange-50/50 rounded-xl p-4 mb-6 space-y-3 border border-orange-100">
                                {conflictData.map((c, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm"></div>
                                        {c.product}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConflictData(null)}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setConflictData(null);
                                        handlePlaceOrder(true);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                                >
                                    Combine & Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl">

                <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors font-medium">
                    <ArrowLeft size={20} /> Back to Cart
                </Link>

                {/* Visual Header / Stepper */}
                <div className="flex items-center justify-between mb-8 max-w-3xl">
                    <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <Check size={14} /> Cart
                        </span>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <span className="text-gray-900 font-bold bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                            Checkout
                        </span>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <span className="text-gray-400 font-medium px-2">
                            Done
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
                    {/* Left Column: Details */}
                    <div className="flex-1 space-y-8">

                        {/* 1. Shipping Address */}
                        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">1</div>
                                    Shipping Address
                                </h2>
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-emerald-600 font-bold text-xs hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add New
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-500 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {selectedAddress ? (() => {
                                                const addr = addressList.find(a => a._id === selectedAddress);
                                                if (!addr) return <span className="text-gray-500 text-sm font-medium">Select an address</span>;
                                                return (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                            {addr.type === 'Work' ? <Briefcase size={16} /> : <Home size={16} />}
                                                        </div>
                                                        <div className="flex flex-col items-start overflow-hidden">
                                                            <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                                                {addr.type}
                                                                {addr.isDefault && (
                                                                    <span className="text-[10px] uppercase font-bold tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Default</span>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-gray-500 truncate w-full text-left">
                                                                {addr.street}, {addr.city}...
                                                            </span>
                                                        </div>
                                                    </>
                                                );
                                            })() : (
                                                <div className="flex items-center gap-3 text-gray-400">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <MapPin size={16} />
                                                    </div>
                                                    <span className="text-sm font-medium">Add or select an address</span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${showAddressDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showAddressDropdown && (
                                        <div className="absolute top-full left-0 w-full mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-500 px-2">Saved Addresses</span>
                                                <button onClick={() => setShowAddressDropdown(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={14} /></button>
                                            </div>
                                            <div className="max-h-[240px] overflow-y-auto p-2 space-y-2">
                                                {addressList.map((addr) => (
                                                    <button
                                                        key={addr._id}
                                                        onClick={() => {
                                                            setSelectedAddress(addr._id);
                                                            setShowAddressDropdown(false);
                                                        }}
                                                        className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 group text-left
                                                            ${selectedAddress === addr._id
                                                                ? 'border-emerald-500 bg-emerald-50/30'
                                                                : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                                                    >
                                                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0
                                                            ${selectedAddress === addr._id ? 'border-emerald-600 bg-white' : 'border-gray-300'}`}>
                                                            {selectedAddress === addr._id && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-0.5">
                                                                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                                                    {addr.type === 'Work' ? <Briefcase size={12} className="text-gray-400" /> : <Home size={12} className="text-gray-400" />}
                                                                    {addr.type}
                                                                </span>
                                                                {addr.isDefault && (
                                                                    <span className="text-[10px] uppercase font-bold tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Default</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 leading-snug">
                                                                {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <AddressModal isOpen={showAddressForm} onClose={() => setShowAddressForm(false)} />
                        </section>

                        {/* 2. Payment Method */}
                        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">2</div>
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                {/* Dropdown Selection */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-500 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const currentMethod = [
                                                    { id: 'card', name: 'Card', icon: CreditCard },
                                                    { id: 'wallet', name: 'Wallet', icon: Wallet },
                                                    { id: 'upi', name: 'UPI', icon: Smartphone },
                                                    { id: 'cod', name: 'Cash', icon: Truck }
                                                ].find(m => m.id === paymentMethod);

                                                if (!currentMethod) {
                                                    return (
                                                        <>
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                                                <CreditCard size={16} />
                                                            </div>
                                                            <span className="font-medium text-gray-500 text-sm">Select Payment Method</span>
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                            <currentMethod.icon size={16} />
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-sm">{currentMethod.name}</span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${showPaymentDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showPaymentDropdown && (
                                        <div className="absolute top-full left-0 w-full mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            {[
                                                { id: 'card', name: 'Card', icon: CreditCard },
                                                { id: 'wallet', name: 'Wallet', icon: Wallet },
                                                { id: 'upi', name: 'UPI', icon: Smartphone },
                                                { id: 'cod', name: 'Cash', icon: Truck }
                                            ].filter(m => !isSubscription || m.id === 'wallet')
                                                .map(method => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => {
                                                            setPaymentMethod(method.id);
                                                            setShowPaymentDropdown(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors
                                                            ${paymentMethod === method.id ? 'bg-emerald-50/50 text-emerald-700' : 'text-gray-700'}`}
                                                    >
                                                        <method.icon size={16} className={paymentMethod === method.id ? 'text-emerald-600' : 'text-gray-400'} />
                                                        <span className={`text-sm ${paymentMethod === method.id ? 'font-bold' : 'font-medium'}`}>{method.name}</span>
                                                        {paymentMethod === method.id && <Check size={14} className="ml-auto text-emerald-600" />}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Content Area */}
                                <div className="pt-2">
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            {cards.length > 0 ? (
                                                <div className="space-y-3">
                                                    {cards.map(card => (
                                                        <label key={card._id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 ${selectedCard === card._id ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100'}`}>
                                                            <input
                                                                type="radio"
                                                                name="card"
                                                                value={card._id}
                                                                checked={selectedCard === card._id}
                                                                onChange={() => setSelectedCard(card._id)}
                                                                className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-bold text-gray-900 uppercase">{card.brand}</p>
                                                                    <span className="text-gray-400 text-xs">•••• {card.last4}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500">Expires {card.expMonth}/{card.expYear}</p>
                                                            </div>
                                                            <CreditCard size={20} className="text-gray-400" />
                                                        </label>
                                                    ))}
                                                    <button
                                                        onClick={() => setShowCardModal(true)}
                                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/10 transition-all"
                                                    >
                                                        <Plus size={16} /> Add New Card
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                                    <CreditCard className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                                    <p className="text-gray-500 text-sm mb-4">No saved cards found.</p>
                                                    <button
                                                        onClick={() => setShowCardModal(true)}
                                                        className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-emerald-600 font-bold text-sm hover:bg-gray-50"
                                                    >
                                                        Add New Card
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentMethod === 'wallet' && (
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-fadeIn">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-gray-500 font-medium text-sm mb-1">Current Balance</p>
                                                    <h3 className="text-3xl font-extrabold text-gray-900">₹{user.walletBalance?.toFixed(2) || '0.00'}</h3>
                                                </div>
                                                <Wallet className="text-emerald-500/20 w-16 h-16 -mb-4 -mr-4" />
                                            </div>

                                            {user.walletBalance >= finalTotal ? (
                                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-100/50 p-3 rounded-lg">
                                                    <Check size={16} /> Sufficient balance for this order
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="text-red-600 font-bold text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                                        <Info size={16} /> Insufficient Balance
                                                    </div>
                                                    <Link to="/wallet" className="block text-center w-full py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition">
                                                        Top Up Wallet
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentMethod === 'upi' && (
                                        <div className="space-y-4 max-w-md animate-fadeIn">
                                            {/* UPI Mode Tabs */}
                                            <div className="flex p-1 bg-gray-100 rounded-xl">
                                                <button
                                                    onClick={() => setUpiMode('id')}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${upiMode === 'id' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Enter UPI ID
                                                </button>
                                                <button
                                                    onClick={() => setUpiMode('qr')}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${upiMode === 'qr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Scan QR Code
                                                </button>
                                            </div>

                                            {upiMode === 'id' ? (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID / VPA</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="username@bank"
                                                            value={upiVpa}
                                                            onChange={(e) => setUpiVpa(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                                                        />
                                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        We'll send a payment request to your UPI app.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-3 relative group">
                                                        {/* Placeholder QR using a public API for demo */}
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@bank&pn=QuickKart&am=${finalTotal}&cu=INR`}
                                                            alt="Payment QR"
                                                            className="w-32 h-32 opacity-90 group-hover:opacity-100 transition-opacity"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="bg-white p-1 rounded-full shadow-sm">
                                                                <Smartphone size={20} className="text-emerald-600" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-900">Scan with any UPI App</p>
                                                    <p className="text-[10px] text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                                                </div>
                                            )}

                                            {/* App Links */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Or Pay via App</p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[
                                                        { name: 'GPay', color: 'bg-white border text-gray-800', border: 'border-gray-200 hover:border-gray-300' },
                                                        { name: 'PhonePe', color: 'bg-[#5f259f] text-white', border: 'hover:bg-[#4a1c7f]' },
                                                        { name: 'Paytm', color: 'bg-[#00baf2] text-white', border: 'hover:bg-[#009bc9]' },
                                                        { name: 'BHIM', color: 'bg-[#29bf12] text-white', border: 'hover:bg-[#23a50e]' }
                                                    ].map(app => (
                                                        <button key={app.name} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition border border-transparent ${app.border} hover:shadow-sm`}>
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${app.color}`}>
                                                                {app.name === 'GPay' ? (
                                                                    <span className="flex">
                                                                        <span className="text-blue-500">G</span>
                                                                        <span className="text-green-500">P</span>
                                                                        <span className="text-yellow-500">a</span>
                                                                        <span className="text-red-500">y</span>
                                                                    </span>
                                                                ) : (
                                                                    app.name[0]
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-gray-600">{app.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'cod' && (
                                        <div className="text-center py-8 animate-fadeIn">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                                <Truck size={32} />
                                            </div>
                                            <p className="font-bold text-gray-900">Cash on Delivery</p>
                                            <p className="text-sm text-gray-500">Pay cash when your order is delivered.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <AddressModal isOpen={showAddressForm} onClose={() => setShowAddressForm(false)} />
                            <CardModal
                                isOpen={showCardModal}
                                onClose={() => setShowCardModal(false)}
                                onSuccess={() => {
                                    fetchCards();
                                    alert('Card added successfully!');
                                }}
                            />
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-[380px] xl:w-[420px] shrink-0">
                        <div className="sticky top-28">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 overflow-hidden relative"
                            >
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"></div>

                                <h3 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal ({items.reduce((a, c) => a + c.quantity, 0)} items)</span>
                                        <span className="font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600 font-bold">Free</span>
                                    </div>

                                    {isSubscription && (
                                        <div className="flex justify-between text-sm text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                                            <span className="font-bold">Subscription Discount</span>
                                            <span className="font-bold">-15%</span>
                                        </div>
                                    )}

                                    <div className="border-t border-dashed border-gray-200 my-4"></div>

                                    <div className="flex justify-between items-baseline">
                                        <span className="text-base font-bold text-gray-900">Total to Pay</span>
                                        <span className="text-2xl font-extrabold text-gray-900">₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Subscription Toggle */}
                                <div
                                    onClick={() => setIsSubscription(!isSubscription)}
                                    className={`mb-6 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group
                                        ${isSubscription ? 'border-emerald-500 bg-white' : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'}`}
                                >
                                    {isSubscription && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100 to-transparent -mr-6 -mt-6 rounded-full blur-xl"></div>}

                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                                            ${isSubscription ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>
                                            {isSubscription && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold text-sm ${isSubscription ? 'text-emerald-700' : 'text-gray-700'}`}>Subscribe & Save 15%</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-snug">
                                                Get items delivered automatically. Cancel anytime.
                                            </p>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isSubscription && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                                                    {['daily', 'weekly', 'monthly'].map(freq => (
                                                        <button
                                                            key={freq}
                                                            onClick={(e) => { e.stopPropagation(); setFrequency(freq); }}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition
                                                                ${frequency === freq
                                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                        >
                                                            {freq}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mt-3">
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
                                                    <CustomCalendar
                                                        value={startDate}
                                                        onChange={(date) => setStartDate(date.toISOString().split('T')[0])}
                                                        minDate={tomorrow}
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        First delivery {startDate ? `scheduled for ${new Date(startDate).toDateString()}` : 'starts immediately'} at 9:00 AM.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => handlePlaceOrder(false)}
                                    disabled={loading || (paymentMethod === 'wallet' && user.walletBalance < finalTotal) || (paymentMethod === 'card' && cards.length === 0)}
                                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {isSubscription ? 'Confirm Subscription' : 'Place Order'}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                    <Lock size={12} />
                                    Secure SSL Encrypted Transaction
                                </div>
                            </motion.div>

                            {/* Trust Badges */}
                            <div className="mt-6 flex justify-between px-4">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mx-auto mb-2">
                                        <Package size={20} />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500">Fast Delivery</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mx-auto mb-2">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500">Buyer Protection</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mx-auto mb-2">
                                        <Clock size={20} />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500">24/7 Support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
