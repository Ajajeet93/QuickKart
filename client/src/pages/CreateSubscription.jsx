import React, { useState, useEffect } from 'react';
import { addDays, addWeeks, addMonths, addQuarters, format, differenceInDays } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_URL from '../config';
import { Calendar, CreditCard, MapPin, Package, Check, AlertCircle, Wallet as WalletIcon, X, ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById } from '../store/productSlice';
import { loadUser } from '../store/authSlice';
import CustomCalendar from '../components/CustomCalendar';

const CreateSubscription = () => {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('productId');
    const weightParam = searchParams.get('weight');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Access Redux Access
    const { user } = useSelector((state) => state.auth);
    const { selectedProduct, loading: productLoading } = useSelector((state) => state.products);

    // Local State
    const { list: addresses } = useSelector((state) => state.addresses); // Use Redux Addresses
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Wallet');
    const [frequency, setFrequency] = useState(searchParams.get('frequency') || 'monthly');
    const [quantity, setQuantity] = useState(parseInt(searchParams.get('qty') || '1'));
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        // 1. Fetch Product if not already loaded or different
        if (productId) {
            if (!selectedProduct || selectedProduct._id !== productId) {
                dispatch(fetchProductById(productId));
            }
        }

        // 2. Auto-select first/default address
        if (addresses.length > 0 && !selectedAddress) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr._id);
        }
    }, [dispatch, productId, selectedProduct, addresses, selectedAddress]);

    useEffect(() => {
        if (selectedProduct && selectedProduct.variants) {
            if (weightParam) {
                const found = selectedProduct.variants.find(v => v.weight === weightParam);
                setSelectedVariant(found || selectedProduct.variants[0]);
            } else if (selectedProduct.variants.length > 0) {
                setSelectedVariant(selectedProduct.variants[0]);
            }
        }
    }, [selectedProduct, weightParam]);

    const handleSubmit = async (e, forceMerge = false) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!selectedProduct) {
            setError('Product not found');
            setSubmitting(false);
            return;
        }

        try {
            const body = {
                items: [{
                    product: selectedProduct._id,
                    quantity,
                    variant: selectedVariant // Pass complete variant object
                }],
                frequency,
                deliveryAddressId: selectedAddress,
                startDate: startDate,
                paymentMethod,
                forceMerge: forceMerge
            };

            const response = await fetch(`${API_URL}/api/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const data = await response.json();
                // 409 Conflict
                if (response.status === 409) {
                    setShowConflictModal(true);
                    setSubmitting(false);
                    return;
                }
                throw new Error(data.message || 'Failed to create subscription');
            }

            // Refresh user for wallet balance update
            dispatch(loadUser());

            navigate('/subscriptions');
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (productLoading || (productId && !selectedProduct)) {
        return <div className="flex justify-center pt-40"><div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent"></div></div>;
    }

    if (!selectedProduct) return <div className="pt-40 text-center text-red-500">Product not found.</div>;

    const currentPrice = selectedVariant ? selectedVariant.price : (selectedProduct.price || 0);
    const totalPrice = currentPrice * quantity;
    const discountedPrice = totalPrice * 0.85;

    const getNextDeliveryDate = () => {
        const start = new Date(startDate + 'T00:00:00');
        let nextDate;
        switch (frequency) {
            case 'daily': nextDate = addDays(start, 1); break;
            case 'weekly': nextDate = addWeeks(start, 1); break;
            case 'monthly': nextDate = addMonths(start, 1); break;
            default: nextDate = addMonths(start, 1);
        }
        return nextDate;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDeliveryDate = getNextDeliveryDate();
    const nextDeliveryDateFormatted = format(nextDeliveryDate, 'MMM d, yyyy');
    const daysUntilNext = differenceInDays(nextDeliveryDate, today);

    return (
        <div className="min-h-screen bg-white font-sans px-6 pt-32 pb-16 relative">
            <div className="max-w-6xl w-full mx-auto mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Product
                </button>
            </div>
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                {/* LEFT — Product Image */}
                <div className="flex flex-col items-center">
                    <div className="rounded-[2rem] w-full max-w-[320px] h-[320px] bg-[#fafafa] border border-gray-200 shadow-[0px_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden mb-6">
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                        />
                    </div>

                    {/* Trust Badges */}
                    <div className="flex gap-6 text-gray-500 text-sm font-medium pt-4 border-t border-gray-100w-full justify-center">
                        <div className="flex items-center gap-2">
                            <Package size={16} className="text-primary" />
                            <span>Flexible Plans</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            <span>Free Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-primary" />
                            <span>Best Value</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Configuration */}
                <div className="space-y-6">

                    {/* Header */}
                    <div>
                        <span className="inline-block px-3 py-1 bg-green-50 text-primary text-xs font-bold rounded-full uppercase tracking-wide mb-3 border border-green-100">
                            Configure Subscription
                        </span>
                        <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                            {selectedProduct.name}
                        </h1>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                            Customize your recurring order. Cancel or skip anytime.
                        </p>
                    </div>

                    {/* Price Summary */}
                    <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                        <span className="text-4xl font-bold text-gray-900">
                            ₹{discountedPrice.toFixed(0)}
                        </span>
                        <span className="text-gray-400 line-through text-lg mb-1">
                            ₹{totalPrice.toFixed(0)}
                        </span>
                        <span className="text-primary text-sm font-bold bg-green-50 px-2 py-1 rounded mb-1">
                            Save 15%
                        </span>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex flex-wrap items-center gap-2 text-sm font-medium">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {/* 1. Frequency */}
                    <div>
                        <label className="block text-xs font-bold mb-3 uppercase tracking-wider text-gray-900">
                            Delivery Frequency
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {['daily', 'weekly', 'monthly'].map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setFrequency(freq)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all border capitalize ${frequency === freq
                                        ? "bg-primary text-white border-primary shadow-lg shadow-green-100"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Quantity & Date Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-bold mb-3 uppercase tracking-wider text-gray-900">
                                Quantity
                            </label>
                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200 h-12 w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:text-primary transition"
                                >
                                    -
                                </button>
                                <span className="font-bold text-gray-900 text-lg w-10 text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:text-primary transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-bold mb-3 uppercase tracking-wider text-gray-900">
                                Start Date
                            </label>
                            <CustomCalendar
                                value={startDate}
                                onChange={(date) => setStartDate(date.toISOString().split('T')[0])}
                                minDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Summary & Action */}
                    <div className="pt-6">
                        <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-500">
                            <span>Next Delivery:</span>
                            <span className="text-primary bg-green-50 px-2 py-1 rounded">
                                {nextDeliveryDateFormatted} <span className="opacity-75">({daysUntilNext} days)</span>
                            </span>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-6 space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                                Payment Method
                            </label>

                            {/* Wallet Option */}
                            <label className={`w-full p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'Wallet' ? 'border-primary bg-green-50/30 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Wallet' ? 'border-primary' : 'border-gray-300'}`}>
                                    {paymentMethod === 'Wallet' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Wallet"
                                    checked={paymentMethod === 'Wallet'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="hidden"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">QuickKart Wallet</span>
                                            {user?.walletBalance !== undefined && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.walletBalance >= (startDate === new Date().toISOString().split('T')[0] ? discountedPrice : 0) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    Balance: ₹{user.walletBalance.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <WalletIcon size={20} className="text-primary" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Amount will be deducted daily/weekly from your wallet.
                                    </p>
                                </div>
                            </label>

                        </div>

                        <button
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={submitting}
                            className="w-full py-4 bg-primary text-white rounded-full font-bold text-lg flex justify-center items-center gap-3 hover:bg-[#0a6c1a] transition-all shadow-xl shadow-green-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <>
                                    Confirm Subscription — ₹{discountedPrice.toFixed(0)}
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Conflict Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                                <AlertCircle size={32} />
                            </div>
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Subscription Conflict
                        </h3>
                        <p className="text-gray-600 mb-4">
                            You already have active <strong>{frequency}</strong> subscriptions for the following items:
                        </p>
                        <ul className="bg-gray-50 rounded-xl p-3 mb-6 space-y-2">
                            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {selectedProduct?.name}
                            </li>
                        </ul>
                        <p className="text-sm text-gray-500 mb-6">
                            Do you want to add these items to your existing subscriptions?
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowConflictModal(false);
                                    handleSubmit(null, true);
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-[#0a6c1a] shadow-lg shadow-green-100 transition"
                            >
                                Yes, Add to Existing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateSubscription;
