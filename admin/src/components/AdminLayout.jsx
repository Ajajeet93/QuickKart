import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, LogOut, Home, Users, ShoppingBag, LifeBuoy, MoreVertical, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { CLIENT_URL } from '../config';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector(state => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [navigate]);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading || !user || user.role !== 'admin') return <div className="text-center p-10">Loading Admin Panel...</div>;

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };



    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
                <div className="flex items-center gap-2 text-emerald-700">
                    <div className="p-1 bg-emerald-100 rounded-lg">
                        <LayoutDashboard size={20} className="text-emerald-600" />
                    </div>
                    <h1 className="text-lg font-extrabold text-gray-900">QuickKart</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header - Shifted Upward */}
                <div className="p-5 border-b border-gray-100/50 hidden md:block">
                    <div className="flex items-center gap-2.5 text-emerald-700">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <LayoutDashboard size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold tracking-tight text-gray-900 leading-tight">QuickKart</h1>
                            <p className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation - Compact & No Scroll */}
                <nav className="flex-1 px-3 py-4 space-y-6 overflow-hidden hover:overflow-y-auto mt-16 md:mt-0">
                    {/* Analytics Group */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Analytics</p>
                        <div className="space-y-0.5">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                }
                            >
                                <LayoutDashboard size={18} />
                                Overview
                            </NavLink>
                        </div>
                    </div>

                    {/* Catalog Group */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Catalog</p>
                        <div className="space-y-0.5">
                            <NavLink
                                to="/products"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                }
                            >
                                <Package size={18} />
                                Products
                            </NavLink>
                            <NavLink
                                to="/categories"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                }
                            >
                                <Tag size={18} />
                                Categories
                            </NavLink>
                        </div>
                    </div>

                    {/* Management Group */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Management</p>
                        <div className="space-y-0.5">
                            <NavLink
                                to="/orders"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                }
                            >
                                <ShoppingBag size={18} />
                                Orders
                            </NavLink>
                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                }
                            >
                                <Users size={18} />
                                Users
                            </NavLink>
                            <NavLink
                                to="/support"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                }
                            >
                                <LifeBuoy size={18} />
                                Support
                            </NavLink>
                        </div>
                    </div>
                </nav>

                {/* User Dropdown - Modern Style */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="relative group">
                        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200 transition-all duration-200 text-left">
                            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 shadow-sm">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Admin'}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <MoreVertical size={16} className="text-gray-400 group-hover:text-gray-600" />
                        </button>

                        {/* Dropup Menu (Invisible normally, shows on hover of the container for simplicity) */}
                        <div className="absolute bottom-full left-0 w-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1 mx-1">
                                <NavLink
                                    to={CLIENT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <Home size={16} />
                                    Back to Store
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
