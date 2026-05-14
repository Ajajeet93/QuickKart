import React from 'react';
import { Users, Leaf, Clock, Heart, Award, ShieldCheck, TrendingUp, Smartphone, Linkedin } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 overflow-x-hidden">

            {/* 1. Hero Section - Immersive Gradient */}
            <section className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center mb-20">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-white to-blue-50/50 opacity-70 -z-10 rounded-3xl mx-4 transform -skew-y-1"></div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-primary text-sm font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    Our Mission
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                    Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#2E7D32]">Freshness</span><br />
                    For Everyone
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900 delay-100 mb-8">
                    Our mission is to make healthy living accessible to everyone. We're building a future where accessing high-quality, organic food is as simple as a tap. At QuickKart, there are no compromises—just pure, farm-fresh goodness delivered straight to your doorstep.
                </p>
                <div className="flex justify-center items-center gap-2 text-gray-600 font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    <Smartphone size={20} className="text-primary" />
                    <span>Available on mobile app & web</span>
                </div>
            </section>

            {/* 2. Values Grid - Glassmorphism Cards */}
            <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', title: '100% Organic', desc: 'Sourced directly from certified local farmers to ensure purity and authenticity.' },
                        { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', title: 'Fast Delivery', desc: 'From farm to table in under 60 minutes—freshness you can taste.' },
                        { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Community First', desc: 'Empowering local farming families and promoting sustainable livelihoods.' },
                        { icon: Heart, color: 'text-red-600', bg: 'bg-red-50', title: 'Quality Care', desc: 'Every product is hand-picked with attention, ensuring top-tier quality.' },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Story Section - Split Layout */}
            <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="bg-gray-900 rounded-[3rem] overflow-hidden text-white relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-12 md:p-20 flex flex-col justify-center relative z-10">
                            <span className="text-green-400 font-bold tracking-widest uppercase text-sm mb-4">Our Journey</span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">From a Small Idea to <br /> Your Kitchen Table</h2>
                            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                                <p>
                                    QuickKart was founded in 2020 with a simple mission—make organic food accessible, affordable, and reliable.
                                </p>
                                <p>
                                    What started as a small initiative has now evolved into a growing platform, connecting customers with trusted farmers and delivering freshness at scale.
                                </p>
                                <p>
                                    Today, QuickKart proudly partners with local farms and serves customers across multiple cities, building a healthier and more sustainable future with eco-packaging and low carbon delivery.
                                </p>
                            </div>

                            <div className="flex gap-8 mt-12 pt-12 border-t border-gray-800">
                                <div>
                                    <div className="text-4xl font-bold text-green-400 mb-1">10+</div>
                                    <div className="text-gray-400 text-sm">Partner Farms</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-green-400 mb-1">500+</div>
                                    <div className="text-gray-400 text-sm">Happy Customers</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-green-400 mb-1">5+</div>
                                    <div className="text-gray-400 text-sm">Cities Served</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-96 lg:h-auto">
                            <img
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
                                alt="Farm scene"
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900 lg:bg-gradient-to-r"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Leadership Section */}
            <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the Founder</h2>
                    <p className="text-gray-500 text-lg">The passionate mind driving the organic revolution.</p>
                </div>

                <div className="max-w-sm mx-auto text-center">
                    <div className="relative w-64 h-64 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                        <img
                            src="/assets/ajeet.jpg"
                            alt="Ajeet Yadav"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                            <div className="flex gap-4 text-white">
                                <a href="https://www.linkedin.com/in/ajeet930/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-blue-600 transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Ajeet Yadav</h3>
                    <p className="text-primary font-medium tracking-wide uppercase text-sm mb-4">CEO & Founder, QuickKart</p>
                    <p className="text-gray-500 leading-relaxed">
                        Driven by a vision to simplify access to organic food, Ajeet founded QuickKart to bridge the gap between local farmers and modern consumers through technology and trust.
                    </p>
                </div>
            </section>

        </div>
    );
};

export default About;
