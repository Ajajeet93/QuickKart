import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Package, Tag, LogOut, Home, Users, ShoppingBag,
    LifeBuoy, Menu, X, Bell, Search, ChevronDown,
    AlertTriangle, Boxes, TrendingUp, Settings
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { CLIENT_URL } from '../config';
import api from '../api';

/* ── Nav link helper ─────────────────────────────────────────────── */
const SideLink = ({ to, icon: Icon, label, badge, exact }) => (
    <NavLink to={to} end={exact}
        className={({ isActive }) =>
            `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
            ${isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
        <div className="flex items-center gap-3">
            <Icon size={17} className="flex-shrink-0" />
            <span>{label}</span>
        </div>
        {badge > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </NavLink>
);

const NavGroup = ({ label, children }) => (
    <div className="space-y-0.5">
        <p className="px-3 text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.15em] mb-2 mt-1">{label}</p>
        {children}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════════════════════════════ */
const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useSelector(state => state.auth);

    const [sidebarOpen,    setSidebarOpen]    = useState(false);
    const [badges,         setBadges]         = useState({ pendingOrders: 0, lowStock: 0 });
    const [notifications,  setNotifications]  = useState([]);
    const [notifOpen,      setNotifOpen]      = useState(false);
    const [profileOpen,    setProfileOpen]    = useState(false);
    const [globalSearch,   setGlobalSearch]   = useState('');
    const notifRef  = useRef(null);
    const profileRef = useRef(null);

    // Close sidebar on route change
    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    // Auth guard removed — handled by ProtectedRoute in App.jsx

    // Fetch live badge counts
    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const [ordersRes, statsRes] = await Promise.all([
                    api.get('/api/v1/admin/orders'),
                    api.get('/api/v1/admin/stats'),
                ]);
                const orders = ordersRes.data.data || [];
                const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
                const lowStock = statsRes.data.data?.lowStockProducts?.length || 0;
                setBadges({ pendingOrders: pending, lowStock });

                // Build notifications
                const notifs = [];
                if (pending > 0) notifs.push({ id: 1, type: 'order', msg: `${pending} order${pending > 1 ? 's' : ''} need attention`, time: 'Now', color: 'text-amber-500', bg: 'bg-amber-50' });
                if (lowStock > 0) notifs.push({ id: 2, type: 'stock', msg: `${lowStock} product${lowStock > 1 ? 's' : ''} running low on stock`, time: 'Now', color: 'text-red-500', bg: 'bg-red-50' });
                setNotifications(notifs);
            } catch (e) { /* silent */ }
        };
        if (user?.role === 'admin') {
            fetchBadges();
            const interval = setInterval(fetchBadges, 60000); // refresh every minute
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);



    const handleLogout = () => { dispatch(logoutUser()); navigate('/login'); };
    const totalNotifs = notifications.length;
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ══════════════════════════════════════════
                SIDEBAR — Dark themed
            ══════════════════════════════════════════ */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 w-60 flex flex-col
                bg-[#111827] border-r border-white/5
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <ShoppingBag size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold text-white leading-none">QuickKart</h1>
                        <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                    <NavGroup label="Overview">
                        <SideLink to="/" icon={LayoutDashboard} label="Dashboard" exact />
                    </NavGroup>

                    <NavGroup label="Catalog">
                        <SideLink to="/products"   icon={Package}  label="Products" />
                        <SideLink to="/categories" icon={Tag}      label="Categories" />
                        <SideLink to="/inventory"  icon={Boxes}    label="Inventory" badge={badges.lowStock} />
                    </NavGroup>

                    <NavGroup label="Operations">
                        <SideLink to="/orders" icon={ShoppingBag} label="Orders" badge={badges.pendingOrders} />
                        <SideLink to="/users"  icon={Users}       label="Users" />
                    </NavGroup>

                    <NavGroup label="System">
                        <SideLink to="/support" icon={LifeBuoy} label="Support" />
                    </NavGroup>
                </nav>

                {/* Admin Profile */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-2 space-y-0.5">
                        <a href={CLIENT_URL} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Home size={14} /> View Storefront
                        </a>
                        <button onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* ══════════════════════════════════════════
                MAIN AREA
            ══════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── Top Header Bar ── */}
                <header className="h-16 flex-shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 gap-4 shadow-sm z-10">

                    {/* Left: hamburger + search */}
                    <div className="flex items-center gap-3 flex-1">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="relative hidden sm:flex items-center flex-1 max-w-xs">
                            <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <input type="text" placeholder="Search anything…"
                                value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    {/* Right: notifications + profile */}
                    <div className="flex items-center gap-2">

                        {/* Notifications Bell */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setNotifOpen(!notifOpen)}
                                className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                                <Bell size={18} />
                                {totalNotifs > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                                        {totalNotifs}
                                    </span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <p className="font-bold text-gray-900 text-sm">Notifications</p>
                                        {totalNotifs > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{totalNotifs} new</span>}
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="py-10 text-center text-gray-400">
                                            <Bell size={28} className="mx-auto mb-2 text-gray-200" />
                                            <p className="text-sm">All clear! No alerts.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {notifications.map(n => (
                                                <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${n.bg}`}>
                                                    <AlertTriangle size={16} className={`${n.color} flex-shrink-0 mt-0.5`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{n.msg}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                        <button className="w-full text-xs text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Button */}
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-extrabold">
                                    {initials}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[10px] text-gray-400">Administrator</p>
                                </div>
                                <ChevronDown size={13} className="text-gray-400 hidden md:block" />
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden p-1.5">
                                    <div className="px-3 py-2.5 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <a href={CLIENT_URL} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                                        <Home size={15} /> View Storefront
                                    </a>
                                    <button onClick={handleLogout}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1">
                                        <LogOut size={15} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main className="flex-1 overflow-auto">
                    <div className="p-4 md:p-7">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
