import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white pt-10 pb-6 border-t border-gray-100">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </div>
                            <span className="text-xl font-bold text-gray-800 tracking-tight">QuickKart</span>
                        </div>
                        <p className="text-gray-500 mb-4 leading-relaxed text-sm">
                            The best grocery delivery service. Fresh produce, fast delivery, and excellent customer service right to your doorstep.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all duration-300">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-base">Company</h4>
                        <ul className="space-y-2 text-gray-500 text-sm">
                            <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
                            <li><Link to="/blog" className="hover:text-primary transition">Blog</Link></li>
                            <li><Link to="/products" className="hover:text-primary transition">All Products</Link></li>
                            <li><a href="#" className="hover:text-primary transition">Locations Map</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-base">Services</h4>
                        <ul className="space-y-2 text-gray-500 text-sm">
                            <li><Link to="/orders" className="hover:text-primary transition">Order Tracking</Link></li>
                            <li><a href="#" className="hover:text-primary transition">Wish List</a></li>
                            <li><Link to="/profile" className="hover:text-primary transition">My Account</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition">Terms & Conditions</Link></li>
                            <li><Link to="/support/tickets" className="hover:text-primary transition">Support Tickets</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-base">Subscribe</h4>
                        <p className="text-gray-500 mb-4 text-sm">Subscribe to our newsletter to get the latest updates and offers.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 bg-gray-100 px-3 py-2 text-sm rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary w-full"
                            />
                            <button className="bg-primary text-white px-4 py-2 rounded-r-lg font-bold hover:bg-green-600 transition text-sm">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} QuickKart. All rights reserved.</p>
                    <div className="flex gap-6 mt-2 md:mt-0">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
