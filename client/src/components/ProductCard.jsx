import React, { useState, useEffect } from 'react';
import { Plus, Minus, Clock, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, updateQuantityAsync, removeFromCartAsync } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: cartItems } = useSelector(state => state.cart);
    // const cartItems = []; // DUMMY
    const [isVariantOpen, setIsVariantOpen] = useState(false);

    // Default to first variant if available
    const [selectedVariant, setSelectedVariant] = useState(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );

    // Update selected variant if product changes (e.g. recycling component)
    React.useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product]);

    // Check if THIS specific variant is in cart
    const cartItem = cartItems.find(item =>
        item._id === product._id && item.variant?.weight === selectedVariant?.weight
    );
    const qty = cartItem ? cartItem.quantity : 0;

    const handleAdd = (e) => {
        e.stopPropagation();
        if (product.variants?.length > 0 && !selectedVariant) return;

        dispatch(addToCartAsync({
            ...product,
            variant: selectedVariant || null,
            price: selectedVariant ? selectedVariant.price : product.price,
            quantity: 1
        }));
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        if (product.variants?.length > 0 && !selectedVariant) return;

        dispatch(addToCartAsync({
            ...product,
            variant: selectedVariant || null,
            price: selectedVariant ? selectedVariant.price : product.price,
            quantity: 1
        }));
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        if (qty > 0) {
            const newQty = qty - 1;
            const weight = selectedVariant ? selectedVariant.weight : null;

            if (qty === 1) {
                dispatch(removeFromCartAsync({ id: product._id, weight }));
            } else {
                dispatch(updateQuantityAsync({ id: product._id, quantity: newQty, weight }));
            }
        }
    };

    // Display price calculation
    const displayPrice = selectedVariant ? selectedVariant.price : product.price;

    return (
        <div
            onClick={() => navigate(`/product/${product._id || 'mock_prod_id'}`)}
            className="group bg-white rounded-2xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-transparent hover:border-gray-100 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
        >
            {/* Image Container - Cover & Wide */}
            <div className="relative aspect-[4/3] mb-2 rounded-xl overflow-hidden bg-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold text-gray-700 shadow-sm flex items-center gap-0.5">
                    <Clock size={10} className="text-green-600" /> 10m
                </div>
            </div>

            {/* Content - Compact */}
            <div className="flex flex-col flex-1 px-1">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">{product.name}</h3>

                {/* Custom Variant Selector */}
                <div onClick={(e) => e.stopPropagation()} className="mb-2 relative">
                    {product.variants && product.variants.length > 1 ? (
                        <>
                            <button
                                onClick={() => setIsVariantOpen(!isVariantOpen)}
                                className="w-full flex items-center justify-between bg-gray-50 hover:bg-white border border-gray-200 hover:border-green-500 rounded-lg px-2 py-1.5 transition-all group/selector"
                            >
                                <span className="text-[11px] font-bold text-gray-700">{selectedVariant?.weight}</span>
                                <ChevronDown size={14} className={`text-gray-400 group-hover/selector:text-green-500 transition-transform duration-200 ${isVariantOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Animated Variant Dropdown */}
                            <AnimatePresence>
                                {isVariantOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden"
                                    >
                                        {product.variants.map((v) => (
                                            <div
                                                key={v.weight}
                                                onClick={() => {
                                                    setSelectedVariant(v);
                                                    setIsVariantOpen(false);
                                                }}
                                                className={`px-3 py-2 text-[11px] font-medium cursor-pointer flex justify-between items-center transition-colors ${selectedVariant?.weight === v.weight ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <span>{v.weight}</span>
                                                {selectedVariant?.weight === v.weight && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <div className="px-2 py-1.5 bg-gray-50 rounded-lg border border-transparent">
                            <span className="text-[11px] font-bold text-gray-500">{selectedVariant?.weight || '1 Unit'}</span>
                        </div>
                    )}
                </div>

                {/* Price & Action */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-gray-400 line-through mb-0.5">₹{Math.round(displayPrice * 1.2)}</span>
                        <span className="text-sm font-black text-gray-900">₹{displayPrice}</span>
                    </div>

                    {/* Modern Pill Button */}
                    <div onClick={(e) => e.stopPropagation()}>
                        {qty === 0 ? (
                            <button
                                onClick={handleAdd}
                                className="px-5 py-1.5 rounded-lg bg-white border border-green-600 text-green-700 text-xs font-bold hover:bg-green-50 transition shadow-sm uppercase tracking-wide"
                            >
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center bg-green-600 text-white rounded-lg px-2 py-1 gap-3 shadow-md">
                                <button onClick={handleDecrement} className="hover:bg-green-700 rounded transition"><Minus size={14} /></button>
                                <span className="text-xs font-bold">{qty}</span>
                                <button onClick={handleIncrement} className="hover:bg-green-700 rounded transition"><Plus size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);
