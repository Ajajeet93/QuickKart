import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Check, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../store/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import API_URL from '../config';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        capital: false,
        small: false,
        number: false,
        special: false
    });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const { password } = formData;
        setPasswordCriteria({
            length: password.length >= 8,
            capital: /[A-Z]/.test(password),
            small: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [formData.password]);

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Please ensure your password meets all requirements.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                    <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 text-xs mt-1">Join QuickKart today</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                    <InputGroup
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        icon={<User size={16} />}
                    />

                    <InputGroup
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        icon={<Mail size={16} />}
                    />

                    <InputGroup
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone (Optional)"
                        icon={<Phone size={16} />}
                    />

                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={16} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setIsPasswordFocused(true)}
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

                    {/* Compact Password Criteria (Collapsible) */}
                    <AnimatePresence>
                        {isPasswordFocused && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-2">
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        <Requirement met={passwordCriteria.length} text="8+ chars" />
                                        <Requirement met={passwordCriteria.capital} text="Uppercase" />
                                        <Requirement met={passwordCriteria.small} text="Lowercase" />
                                        <Requirement met={passwordCriteria.number} text="Number" />
                                        <Requirement met={passwordCriteria.special} text="Special" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-4 text-sm shadow-lg shadow-green-100 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
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
                        onError={() => console.log('Login Failed')}
                        theme="outline"
                        size="medium"
                        width="300"
                        text="continue_with"
                        shape="pill"
                    />
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

const InputGroup = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
        </div>
        <input
            {...props}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
        />
    </div>
);

const Requirement = ({ met, text }) => (
    <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors duration-200 ${met ? 'text-green-600' : 'text-gray-400'}`}>
        <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${met ? 'bg-green-100 border-green-200 text-green-600' : 'border-gray-200 bg-gray-50'}`}>
            {met && <Check size={8} strokeWidth={3} />}
        </div>
        {text}
    </div>
);

export default Signup;
