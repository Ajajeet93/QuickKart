import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { removeFromCartAsync, updateQuantityAsync } from '../store/cartSlice';

const Cart = () => {
    const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleQuantity = (id, newQty, weight) => {
        dispatch(updateQuantityAsync({ id, quantity: newQty, weight }));
    };

    const handleRemove = (id, weight) => {
        dispatch(removeFromCartAsync({ id, weight }));
    };

    const handleCheckout = () => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout'); // Will be created next
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-12 bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Trash2 size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition shadow-lg shadow-green-200">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-12 bg-gray-50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-8">
                    <Link to="/products" className="text-gray-500 hover:text-primary transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart <span className="text-gray-400 text-lg font-normal">({totalQuantity} items)</span></h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {items.map((item) => (
                            <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                    {item.variant && (
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Size: {item.variant.weight}</p>
                                    )}
                                    <p className="text-primary font-bold mt-1">₹{item.variant?.price || item.price}</p>
                                    <Link
                                        to={`/create-subscription?productId=${item._id}&qty=${item.quantity}${item.variant ? `&weight=${item.variant.weight}` : ''}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-green-50 px-2 py-1 rounded-md mt-2 hover:bg-green-100 transition"
                                    >
                                        Subscribe & Save 15%
                                    </Link>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => handleQuantity(item._id, item.quantity - 1, item.variant?.weight)}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:text-red-500 transition disabled:opacity-50"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantity(item._id, item.quantity + 1, item.variant?.weight)}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:text-green-600 transition"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleRemove(item._id, item.variant?.weight)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {/* Item Breakdown */}
                                <div className="space-y-2 pb-4 border-b border-gray-100">
                                    {items.map((item) => {
                                        const price = item.variant ? item.variant.price : item.price;
                                        return (
                                            <div key={`${item._id}-${item.variant?.weight}`} className="flex justify-between text-sm text-gray-600">
                                                <span className="truncate pr-4">
                                                    {item.quantity}x {item.name} <span className="text-xs text-gray-400">({item.variant?.weight || 'Std'})</span>
                                                </span>
                                                <span className="font-medium whitespace-nowrap">₹{(price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all shadow-lg flex items-center justify-center gap-2 group"
                            >
                                Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-4 text-center">
                                <Link to="/products" className="text-sm text-gray-500 hover:text-primary font-medium">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
