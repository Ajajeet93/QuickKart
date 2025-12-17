import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollToTop from './components/ScrollToTop';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/authSlice';
import { fetchAddresses } from './store/addressSlice';
import { fetchCart } from './store/cartSlice';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Fetch addresses when user is loaded
  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen relative overflow-hidden font-sans selection:bg-primary selection:text-white">

        {/* Global Background Gradient */}
        <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#FDFBF7] via-[#f1f8f2] to-[#e8f5e9]"></div>

        <Navbar />

        <Suspense fallback={<LoadingSpinner />}>
          <AnimatedRoutes />
        </Suspense>

        <Toaster position="top-center" toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#EBF7EE',
              color: '#0C831F',
              border: '1px solid #0C831F'
            },
            iconTheme: {
              primary: '#0C831F',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #DC2626'
            }
          }
        }} />

      </div>
    </Router>
  );
}

export default App;
