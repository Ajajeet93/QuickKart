import React from 'react';
import { Users, Leaf, Clock, Heart, Award, ShieldCheck, TrendingUp } from 'lucide-react';

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
                <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900 delay-100">
                    We're building a future where accessing high-quality, organic food is as simple as a tap. No compromises, just pure goodness delivered to your door.
                </p>
            </section>

            {/* 2. Values Grid - Glassmorphism Cards */}
            <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', title: '100% Organic', desc: 'Direct from certified local farmers.' },
                        { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', title: 'Fast Delivery', desc: 'From farm to table in under 60 mins.' },
                        { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Community First', desc: 'Supporting 500+ local families.' },
                        { icon: Heart, color: 'text-red-600', bg: 'bg-red-50', title: 'Quality Care', desc: 'Hand-picked with love and attention.' },
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
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">From a Garage to <br /> Your Kitchen Table</h2>
                            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                                <p>
                                    QuickKart began in 2020 when our founders realized that finding quality organic produce was harder than it should be.
                                </p>
                                <p>
                                    What started as a small delivery service for friends and family has grown into a nationwide platform serving millions, partnering with over 500 local farms to ensure sustainability.
                                </p>
                            </div>

                            <div className="flex gap-8 mt-12 pt-12 border-t border-gray-800">
                                <div>
                                    <div className="text-4xl font-bold text-green-400 mb-1">500+</div>
                                    <div className="text-gray-400 text-sm">Partner Farms</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-green-400 mb-1">2M+</div>
                                    <div className="text-gray-400 text-sm">Happy Customers</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-green-400 mb-1">50+</div>
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
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the Visionaries</h2>
                    <p className="text-gray-500 text-lg">The passionate team driving the organic revolution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { name: "Ajeet Yadav", role: "CEO & Co-Founder", img: "/assets/ajeet.jpg", isLocal: true },
                        { name: "Michael Chen", role: "Head of Operations", img: "1472099645785-5658abf4ff4e" },
                        { name: "Emma Davis", role: "Chief Product Officer", img: "1500648767791-00dcc994a43e" }
                    ].map((member, idx) => (
                        <div key={idx} className="group text-center">
                            <div className="relative w-64 h-64 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                                <img
                                    src={member.isLocal ? member.img : `https://images.unsplash.com/photo-${member.img}?auto=format&fit=crop&w=600&q=80`}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                    <div className="flex gap-4 text-white">
                                        {/* Social Icons Placeholder */}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                            <p className="text-primary font-medium tracking-wide uppercase text-sm">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default About;
