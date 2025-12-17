import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShoppingBag, Loader2, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleLogin } from '../store/authSlice';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resultAction = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(resultAction)) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 pt-24 pb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8"
            >
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-green-50 rounded-full text-primary mb-3">
                        <ShoppingBag size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 text-xs mt-1">Log in to continue to QuickKart</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={16} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                            placeholder="Email Address"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                                placeholder="Password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <a href="#" className="text-[10px] font-bold text-primary hover:text-green-700 transition-colors">Forgot password?</a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-2 text-sm shadow-lg shadow-green-100 active:scale-95"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or</span>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            dispatch(googleLogin(credentialResponse.credential)).then((res) => {
                                if (googleLogin.fulfilled.match(res)) {
                                    navigate('/');
                                }
                            });
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        theme="outline"
                        size="medium"
                        width="300"
                        text="continue_with"
                        shape="pill"
                    />
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 mt-1">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-bold hover:text-green-700 transition-colors ml-1 hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
