import React, { lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './PageWrapper';

// Lazy imports moved from App.jsx
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Blog = lazy(() => import('../pages/Blog'));
const BlogPost = lazy(() => import('../pages/BlogPost'));
const TermsConditions = lazy(() => import('../pages/TermsConditions'));
const CategoriesPage = lazy(() => import('../pages/Categories'));
const CategoryProducts = lazy(() => import('../pages/CategoryProducts'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('../pages/PaymentFailed'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const CreateSubscription = lazy(() => import('../pages/CreateSubscription'));
const MySubscriptions = lazy(() => import('../pages/MySubscriptions'));
const SubscriptionDetails = lazy(() => import('../pages/SubscriptionDetails'));
const Wallet = lazy(() => import('../pages/Wallet'));
const ManageAddresses = lazy(() => import('../pages/ManageAddresses'));
const UserSupport = lazy(() => import('../pages/UserSupport'));

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
                <Route path="/blog/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
                <Route path="/categories" element={<PageWrapper><CategoriesPage /></PageWrapper>} />
                <Route path="/category/:slug" element={<PageWrapper><CategoryProducts /></PageWrapper>} />
                <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
                <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
                <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
                <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
                <Route path="/payment-success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
                <Route path="/payment-failed" element={<PageWrapper><PaymentFailed /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
                <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
                <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
                <Route path="/orders/:id" element={<PageWrapper><OrderDetails /></PageWrapper>} />
                <Route path="/terms" element={<PageWrapper><TermsConditions /></PageWrapper>} />
                <Route path="/subscriptions/create" element={<PageWrapper><CreateSubscription /></PageWrapper>} />
                <Route path="/subscriptions" element={<PageWrapper><MySubscriptions /></PageWrapper>} />
                <Route path="/subscriptions/:id" element={<PageWrapper><SubscriptionDetails /></PageWrapper>} />
                <Route path="/wallet" element={<PageWrapper><Wallet /></PageWrapper>} />
                <Route path="/addresses" element={<PageWrapper><ManageAddresses /></PageWrapper>} />
                <Route path="/support/tickets" element={<PageWrapper><UserSupport /></PageWrapper>} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
