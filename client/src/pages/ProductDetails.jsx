import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAsync, updateQuantityAsync, removeFromCartAsync } from "../store/cartSlice";
import { fetchProductById, fetchProducts, clearSelectedProduct } from "../store/productSlice";
import { Truck, ShieldCheck, CheckCircle2, Minus, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedProduct, items: similarProductsList, loading, error } =
        useSelector((state) => state.products);
    const { items } = useSelector((state) => state.cart);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [purchaseType, setPurchaseType] = useState("one-time");
    const [frequency, setFrequency] = useState("weekly");
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(clearSelectedProduct());
            dispatch(fetchProductById(id));
            setSelectedImage(null);
            setQuantity(1);
            setSelectedVariant(null);
            window.scrollTo(0, 0);
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedProduct && selectedProduct.categoryId) {
            const catId =
                typeof selectedProduct.categoryId === "object"
                    ? selectedProduct.categoryId._id
                    : selectedProduct.categoryId;

            if (catId) dispatch(fetchProducts(catId));
        }

        if (selectedProduct?.image) setSelectedImage(selectedProduct.image);

        // Initialize Variant
        if (selectedProduct?.variants && selectedProduct.variants.length > 0) {
            setSelectedVariant(selectedProduct.variants[0]);
        }
    }, [dispatch, selectedProduct]);

    const handleQuantityChange = (change) => {
        const newQty = quantity + change;
        if (newQty >= 1) setQuantity(newQty);
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        // Only require variant if product actually has variants
        if (selectedProduct.variants?.length > 0 && !selectedVariant) return;

        if (purchaseType === "subscription") {
            const weightParam = selectedVariant ? `&weight=${selectedVariant.weight}` : '';
            navigate(
                `/subscriptions/create?productId=${selectedProduct._id}&frequency=${frequency}&qty=${quantity}${weightParam}`
            );
        } else {
            dispatch(addToCartAsync({
                ...selectedProduct,
                variant: selectedVariant || null,
                price: selectedVariant ? selectedVariant.price : selectedProduct.price,
                quantity
            })).then(() => {
                toast.success(`Added ${quantity}x ${selectedProduct.name} to cart`, {
                    style: {
                        border: '1px solid #0C831F',
                        padding: '16px',
                        color: '#0C831F',
                        background: '#F0FDF4',
                    },
                    iconTheme: {
                        primary: '#0C831F',
                        secondary: '#FFFAEE',
                    },
                });
            });
        }
    };

    if (loading && !selectedProduct)
        return <LoadingSpinner />;

    if (error)
        return (
            <div className="min-h-screen pt-40 text-center text-red-500">
                Error: {error}
            </div>
        );

    if (!selectedProduct)
        return (
            <div className="min-h-screen pt-40 text-center">
                Product not found.
            </div>
        );

    const currentPrice = selectedVariant ? selectedVariant.price : selectedProduct.price;
    const subPrice = (currentPrice * 0.85).toFixed(2);

    const categoryName =
        selectedProduct.categoryId?.name ||
        selectedProduct.category ||
        "Grocery";

    const galleryImages = [
        selectedProduct.image,
        ...(selectedProduct.images ? selectedProduct.images.filter(img => img !== selectedProduct.image) : [])
    ].filter(Boolean);

    const toggleFrequency = (freq) => {
        if (frequency === freq) {
            setPurchaseType("one-time");
            setFrequency("");
        } else {
            setPurchaseType("subscription");
            setFrequency(freq);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans px-6 pt-32 pb-16">
            <div className="max-w-6xl w-full mx-auto mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium mb-4"
                >
                    <ArrowLeft size={20} /> Back
                </button>
            </div>
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                {/* LEFT — APPLE STYLE FLOATING IMAGE */}
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2rem] w-full max-w-[320px] h-[320px] bg-[#fafafa] border border-gray-200 shadow-[0px_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden"
                    >
                        {selectedImage && (
                            <motion.img
                                key={selectedImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={selectedImage}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                            />
                        )}
                    </motion.div>

                    {/* Thumbnails */}
                    <div className="flex mt-4 gap-3">
                        {galleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-14 h-14 rounded-xl border transition-all bg-white overflow-hidden ${selectedImage === img
                                    ? "border-black shadow-sm"
                                    : "border-gray-200 hover:border-gray-400"
                                    }`}
                            >
                                <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT — DETAILS */}
                <div className="space-y-6">

                    {/* Category + Rating */}
                    <div className="flex gap-3 items-center">
                        <span className="px-3 py-1 text-xs uppercase font-bold tracking-wider bg-green-50 border border-green-100 rounded-full text-primary">
                            {categoryName}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                            ⭐ 4.8 <span className="text-gray-400 font-normal">(1.1k Reviews)</span>
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                        {selectedProduct.name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-end gap-4">
                        <span className="text-4xl font-bold text-gray-900">
                            ₹{purchaseType === "subscription" ? subPrice : currentPrice}
                        </span>
                        <span className="text-gray-400 line-through text-lg mb-1">
                            ₹{(currentPrice * 1.25).toFixed(0)}
                        </span>
                        <span className="text-primary text-sm font-bold bg-green-50 px-2 py-1 rounded mb-1">
                            20% OFF
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                        {selectedProduct.description || `Fresh and premium quality ${selectedProduct.name} sourced directly for you.`}
                    </p>

                    {/* Weight Selection */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-900">
                                Select Size
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {selectedProduct.variants.map((v) => (
                                    <button
                                        key={v.weight}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${selectedVariant?.weight === v.weight
                                            ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                            }`}
                                    >
                                        {v.weight}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Purchase Options */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Option 1: Buy Once */}
                        <div
                            onClick={() => setPurchaseType('one-time')}
                            className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all ${purchaseType === 'one-time'
                                ? 'border-primary bg-green-50/50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-bold ${purchaseType === 'one-time' ? 'text-primary' : 'text-gray-900'}`}>Buy Once</span>
                                {purchaseType === 'one-time' && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                                {purchaseType !== 'one-time' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                            </div>
                            <div className="text-lg font-bold text-gray-900">₹{currentPrice}</div>
                        </div>

                        {/* Option 2: Subscribe */}
                        <div
                            onClick={() => {
                                setPurchaseType('subscription');
                                if (!frequency) setFrequency('weekly');
                            }}
                            className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all ${purchaseType === 'subscription'
                                ? 'border-primary bg-green-50/50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Save 15%
                            </div>
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-bold ${purchaseType === 'subscription' ? 'text-primary' : 'text-gray-900'}`}>Subscribe</span>
                                {purchaseType === 'subscription' && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                                {purchaseType !== 'subscription' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                            </div>
                            <div className="text-lg font-bold text-gray-900">₹{subPrice}</div>
                        </div>
                    </div>

                    {/* Frequency Options (Only if Subscribe is selected) */}
                    {purchaseType === 'subscription' && (
                        <div className="mb-6 animate-fadeIn">
                            <label className="block text-xs font-bold mb-3 uppercase tracking-wider text-gray-900">
                                Deliver Every
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {["Daily", "Weekly", "Monthly"].map(
                                    (f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFrequency(f.toLowerCase())}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${frequency === f.toLowerCase()
                                                ? "bg-primary text-white border-primary shadow-md"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}


                    {/* Dynamic Cart Control */}
                    {purchaseType === 'subscription' ? (
                        <div className="w-full">
                            <button
                                onClick={handleAddToCart}
                                className="w-full py-4 bg-primary text-white rounded-full font-bold text-lg flex justify-center items-center gap-3 hover:bg-[#0a6c1a] transition-all shadow-xl shadow-green-100 active:scale-[0.98]"
                            >
                                <Truck size={20} />
                                Subscribe Now — ₹{(subPrice * quantity).toFixed(2)}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 items-center w-full max-w-lg">
                            {/* Check if item is in cart */}
                            {items.find(item => item._id === selectedProduct._id && item.variant?.weight === selectedVariant?.weight) ? (
                                <div className="flex-1 py-3 bg-green-50 border border-green-200 text-green-800 rounded-full font-bold text-lg flex justify-between items-center px-6 shadow-sm">
                                    <button
                                        onClick={() => {
                                            const item = items.find(i => i._id === selectedProduct._id && i.variant?.weight === selectedVariant?.weight);
                                            if (item.quantity > 1) {
                                                dispatch(updateQuantityAsync({ id: item._id, quantity: item.quantity - 1, weight: item.variant?.weight }));
                                            } else {
                                                dispatch(removeFromCartAsync({ id: item._id, weight: item.variant?.weight }));
                                            }
                                        }}
                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition text-green-700"
                                    >
                                        <Minus size={20} />
                                    </button>

                                    <span className="flex flex-col items-center leading-tight">
                                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">In Cart</span>
                                        <span className="text-2xl font-black">{items.find(item => item._id === selectedProduct._id && item.variant?.weight === selectedVariant?.weight).quantity}</span>
                                    </span>

                                    <button
                                        onClick={() => {
                                            const item = items.find(i => i._id === selectedProduct._id && i.variant?.weight === selectedVariant?.weight);
                                            dispatch(addToCartAsync({ ...selectedProduct, variant: selectedVariant, price: selectedVariant?.price || selectedProduct.price, quantity: 1 }));
                                        }}
                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition text-green-700"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 py-4 bg-primary text-white rounded-full font-bold text-lg flex justify-center items-center gap-3 hover:bg-[#0a6c1a] transition-all shadow-xl shadow-green-100 active:scale-[0.98]"
                                >
                                    <Truck size={20} />
                                    Add to Cart — ₹{(currentPrice * quantity).toFixed(0)}
                                </button>
                            )}

                            {/* Local Quantity Selector (Only shown if NOT in cart) */}
                            {!items.find(item => item._id === selectedProduct._id && item.variant?.weight === selectedVariant?.weight) && (
                                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200 h-14">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:text-primary hover:scale-110 transition"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold text-gray-900 text-lg w-10 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:text-primary hover:scale-110 transition"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Trust Row */}
                    <div className="flex gap-6 text-gray-500 text-sm font-medium pt-4 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-2">
                            <Truck size={16} className="text-primary" />
                            <span>10-min Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-primary" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-primary" />
                            <span>Free Shipping</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
