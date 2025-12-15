import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock } from 'lucide-react';
import API_URL from '../config';

const CardModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [cardForm, setCardForm] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const handleAddCard = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Card Validation
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Remove spaces for validation
            const cleanNumber = cardForm.number.replace(/\s/g, '');

            // Basic Fake Validation
            if (cleanNumber.length < 13 || cleanNumber.length > 19) throw new Error('Invalid Card Number (13-19 digits)');
            if (!/^\d+$/.test(cleanNumber)) throw new Error('Card number must contain only digits');

            const newCard = {
                brand: 'Visa', // Auto-detect in real app
                last4: cleanNumber.slice(-4),
                expMonth: cardForm.expiry.split('/')[0],
                expYear: cardForm.expiry.split('/')[1],
                cardHolder: cardForm.name
            };

            const res = await fetch(`${API_URL}/api/wallet/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newCard)
            });

            if (res.ok) {
                setCardForm({ number: '', expiry: '', cvc: '', name: '' });
                onSuccess();
                onClose();
            } else {
                const d = await res.json();
                alert(d.message);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-gray-100 relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Add New Card</h3>
                            <p className="text-gray-500 text-sm">Securely save your card for future payments</p>
                        </div>

                        <form onSubmit={handleAddCard} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                                <input
                                    type="text" placeholder="0000 0000 0000 0000" maxLength="23" required
                                    value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                                    <input
                                        type="text" placeholder="MM/YY" maxLength="5" required
                                        value={cardForm.expiry} onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                                    <input
                                        type="password" placeholder="123" maxLength="3" required
                                        value={cardForm.cvc} onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cardholder Name</label>
                                <input
                                    type="text" placeholder="John Doe" required
                                    value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                                />
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Lock size={16} /> Save Card Securely
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CardModal;
