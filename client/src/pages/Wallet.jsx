import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, History, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import API_URL from '../config';

import { useDispatch } from 'react-redux';
import { loadUser } from '../store/authSlice';

const Wallet = () => {
    const dispatch = useDispatch();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [cards, setCards] = useState([]);
    const [showCardForm, setShowCardForm] = useState(false);
    const [cardForm, setCardForm] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const fetchWalletData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/wallet`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch wallet data');
            const data = await res.json();
            setBalance(data.balance);
            setTransactions(data.transactions);

            // Fetch Cards
            const cardsRes = await fetch(`${API_URL}/api/wallet/cards`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (cardsRes.ok) {
                setCards(await cardsRes.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleAddMoney = async (e) => {
        e.preventDefault();
        setError('');
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            // Simulate Payment Gateway Delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const res = await fetch(`${API_URL}/api/wallet/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ amount })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to add money');
            }

            setAmount('');
            fetchWalletData();
            // Refresh user data globally to update Navbar balance
            dispatch(loadUser());
            alert('Money added successfully!');
        } catch (err) {
            setError(err.message || 'Failed to add money');
        } finally {
            setLoading(false);
        }
    };

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
                brand: 'Visa', // Auto-detect in real app, hardcoded for simulation
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
                setShowCardForm(false);
                setCardForm({ number: '', expiry: '', cvc: '', name: '' });
                fetchWalletData();
                alert('Card saved successfully!');
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

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Remove this card?')) return;
        try {
            await fetch(`${API_URL}/api/wallet/cards/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchWalletData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-12 bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3"
                >
                    <WalletIcon className="text-primary" size={32} /> Wallet & Payment Methods
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Balance & Cards Column */}
                    <div className="space-y-8">
                        {/* Balance Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <p className="text-gray-400 font-medium mb-2">Total Balance</p>
                            <h2 className="text-5xl font-bold mb-8">₹{balance.toLocaleString()}</h2>
                            <div className="flex gap-4">
                                <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Active
                                </div>
                            </div>
                        </motion.div>

                        {/* Saved Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <WalletIcon size={20} />
                                    </div> Saved Cards
                                </h3>
                                <button
                                    onClick={() => setShowCardForm(!showCardForm)}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    {showCardForm ? 'Cancel' : '+ Add New'}
                                </button>
                            </div>

                            {showCardForm ? (
                                <form onSubmit={handleAddCard} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fadeIn">
                                    <input
                                        type="text" placeholder="Card Number" maxLength="23" required
                                        value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text" placeholder="MM/YY" maxLength="5" required
                                            value={cardForm.expiry} onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                        <input
                                            type="password" placeholder="CVC" maxLength="3" required
                                            value={cardForm.cvc} onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <input
                                        type="text" placeholder="Cardholder Name" required
                                        value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Save Card'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    {cards.length > 0 ? (
                                        cards.map(card => (
                                            <div key={card._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition bg-white group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-6 bg-gray-800 rounded-sm"></div> {/* Fake Card Icon */}
                                                    <div>
                                                        <p className="font-bold text-gray-800">•••• {card.last4}</p>
                                                        <p className="text-xs text-gray-500">Expires {card.expMonth}/{card.expYear}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteCard(card._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-400 py-4 text-sm">No saved cards</p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Add Money & History Column */}
                    <div className="space-y-8">
                        {/* Add Money Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Plus className="text-primary" /> Add Money
                            </h3>
                            <form onSubmit={handleAddMoney} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Add to Wallet'}
                                </button>
                            </form>
                        </motion.div>

                        {/* Transaction History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <History className="text-gray-400" /> Recent Transactions
                            </h3>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 overflow-x-hidden">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-900 truncate text-sm">{tx.description}</p>
                                                    <p className="text-xs text-gray-500 truncate">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold text-sm whitespace-nowrap ml-4 ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <History size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No transactions yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
