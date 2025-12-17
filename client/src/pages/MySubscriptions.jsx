import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import { Package, Calendar, MoreVertical, Play, Pause, XCircle, AlertCircle, ChevronRight, Clock, Plus, Pencil, Trash2 } from 'lucide-react';

import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar";
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const MySubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchSubs = async () => {
            try {
                const res = await fetch(`${API_URL}/api/subscriptions`, {
                    credentials: 'include'
                });
                const data = await res.json();
                setSubscriptions(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSubs();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await fetch(`${API_URL}/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            // Refresh local state
            setSubscriptions(prev => prev.map(sub => sub._id === id ? { ...sub, status: newStatus } : sub));
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSubId, setSelectedSubId] = useState(null);

    const initiateDelete = (id) => {
        setSelectedSubId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedSubId) return;

        try {
            await fetch(`${API_URL}/api/subscriptions/${selectedSubId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setSubscriptions(prev => prev.filter(sub => sub._id !== selectedSubId));
            setShowDeleteConfirm(false);
            setSelectedSubId(null);
        } catch (err) {
            console.error('Failed to delete subscription', err);
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        if (filter === 'all') return true;
        return sub.frequency === filter;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen pt-24 px-4 bg-gray-50/50 pb-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
                        <p className="text-gray-500 mt-1">Manage your recurring orders</p>
                    </div>

                    {/* Menubar Filter */}
                    <Menubar className="bg-white border-gray-200 rounded-full px-2 h-12 shadow-sm hidden md:flex">
                        <MenubarMenu>
                            <MenubarTrigger
                                onClick={() => setFilter('all')}
                                className={`rounded-full px-4 cursor-pointer font-bold transition-all ${filter === 'all' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                All
                            </MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger
                                onClick={() => setFilter('daily')}
                                className={`rounded-full px-4 cursor-pointer font-bold transition-all ${filter === 'daily' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Daily
                            </MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger
                                onClick={() => setFilter('weekly')}
                                className={`rounded-full px-4 cursor-pointer font-bold transition-all ${filter === 'weekly' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Weekly
                            </MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger
                                onClick={() => setFilter('monthly')}
                                className={`rounded-full px-4 cursor-pointer font-bold transition-all ${filter === 'monthly' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Monthly
                            </MenubarTrigger>
                        </MenubarMenu>
                    </Menubar>

                    <div className="flex gap-3">
                        <Link to="/products" className="px-5 py-2 bg-primary text-white rounded-full font-bold hover:bg-green-600 transition shadow-lg shadow-green-200 flex items-center gap-2">
                            <Plus size={18} /> <span className="hidden sm:inline">Create Subscription</span>
                        </Link>
                    </div>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Package size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Subscriptions</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Start a subscription to save time and money on your favorite items.</p>
                        <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-green-600 transition shadow-lg shadow-green-200">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                        {filteredSubscriptions.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No subscriptions found for this frequency.
                            </div>
                        )}
                        {filteredSubscriptions.map((sub, index) => (
                            <div
                                key={sub._id}
                                className={`p-5 flex items-center justify-between group hover:bg-gray-50 transition-colors ${index !== filteredSubscriptions.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                {/* Left: Image & Info */}
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                                        {/* Show first product image or a generic package icon if multiple distinct products could be confusing, but first product image is fine usually */}
                                        <img
                                            src={sub.items[0]?.product?.image || 'https://via.placeholder.com/150'}
                                            alt={sub.items[0]?.product?.name}
                                            className="w-full h-full object-contain mix-blend-multiply rounded-2xl"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                                            {sub.items.length > 1
                                                ? `${sub.items[0]?.product?.name} + ${sub.items.length - 1} more`
                                                : sub.items[0]?.product?.name || 'Subscription Item'}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <span className="text-gray-500">
                                                Delivered <span className="text-primary capitalize font-bold">{sub.frequency}</span>
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-gray-700 font-bold">
                                                Items: {sub.items.length}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-gray-400">
                                                Next: {new Date(sub.nextDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Status & Action */}
                                <div className="flex items-center gap-6">
                                    {/* Status Pill */}
                                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sub.status === 'Active' ? 'bg-green-100 text-primary' :
                                        sub.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-primary' :
                                            sub.status === 'Paused' ? 'bg-yellow-600' :
                                                'bg-red-600'
                                            }`} />
                                        {sub.status}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/subscriptions/${sub._id}`}
                                            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:bg-green-50 transition-all"
                                            title="Edit Subscription"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button
                                            onClick={() => initiateDelete(sub._id)}
                                            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                                            title="Cancel Subscription"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    title="Cancel Subscription"
                    message="Are you sure you want to cancel this subscription? You won't be billed for future deliveries."
                    confirmText="Yes, Cancel Subscription"
                    cancelText="Keep Subscription"
                    isDestructive={true}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
        </div>
    );
};

export default MySubscriptions;
