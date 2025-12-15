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

      </div>
    </Router>
  );
}

export default App;
