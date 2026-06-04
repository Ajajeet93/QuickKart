import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/authSlice';
import AdminLayout from './components/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';

const AdminLogin      = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts   = lazy(() => import('./pages/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminUsers      = lazy(() => import('./pages/AdminUsers'));
const AdminOrders     = lazy(() => import('./pages/AdminOrders'));
const AdminSupport    = lazy(() => import('./pages/AdminSupport'));
const AdminInventory  = lazy(() => import('./pages/AdminInventory'));

// ── ProtectedRoute — waits for auth check before deciding ─────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  // Still loading initial session — show spinner, don't redirect yet
  if (loading) return <LoadingSpinner />;

  // Auth check done: no valid admin session → go to login
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const dispatch = useDispatch();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // loadUser checks the cookie-based session on app mount.
    // We mark initialized=true only after it settles so routes
    // never flash-redirect before the check is done.
    dispatch(loadUser()).finally(() => setInitialized(true));
  }, [dispatch]);

  // Block rendering until the first auth check is complete
  if (!initialized) return <LoadingSpinner />;

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard"  element={<Navigate to="/" replace />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="inventory"  element={<AdminInventory />} />
            <Route path="support"    element={<AdminSupport />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
