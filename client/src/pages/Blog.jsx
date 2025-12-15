import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Tag, Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOG_POSTS = [
    {
        id: 1,
        title: "Top 10 Benefits of Organic Food for Your Health",
        excerpt: "Discover why switching to organic produce can boost your immune system and overall well-being. From fewer pesticides to more nutrients, learn the facts.",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        author: "Sarah Johnson",
        date: "Oct 24, 2024",
        category: "Health & Wellness",
        readTime: "5 min read",
        slug: "1" // Simplified for ID-based routing
    },
    {
        id: 2,
        title: "Sustainability in 2024: Reducing Your Carbon Footprint",
        excerpt: "Simple, actionable steps to make your grocery shopping more eco-friendly. Learn how local sourcing impacts the environment.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        author: "Michael Chen",
        date: "Oct 20, 2024",
        category: "Sustainability",
        readTime: "4 min read",
        slug: "2"
    },
    {
        id: 3,
        title: "5 Quick & Easy Vegan Recipes for Busy Weeknights",
        excerpt: "Delicious plant-based meals that take less than 30 minutes to prepare. Perfect for anyone looking to eat healthier without spending hours in the kitchen.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        author: "Emma Davis",
        date: "Oct 15, 2024",
        category: "Recipes",
        readTime: "8 min read",
        slug: "3"
    }
];

const Blog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredPosts = BLOG_POSTS.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const CATEGORIES = ['All', 'Health & Wellness', 'Sustainability', 'Recipes'];

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50/50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="inline-block px-3 py-1 bg-green-100 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                        QuickKart Blog
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Fresh Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#2E7D32]">Stories</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Explore nutritious recipes, sustainability tips, and the latest news from the world of organic food.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-lg shadow-green-200"
                                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition bg-white"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Blog Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-lg shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {post.date}
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Tag size={14} />
                                            {post.readTime}
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                                        {post.excerpt}
                                    </p>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{post.author}</span>
                                        </div>
                                        <Link to={`/blog/${post.id}`} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center group-hover:bg-[#0a6c1a] transition-colors">
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-500">Try searching for something else or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
