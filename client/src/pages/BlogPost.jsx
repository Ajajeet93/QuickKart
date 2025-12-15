import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ChevronLeft, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';

// Reusing mock data directly for simplicity (in real app, fetch from ID)
const BLOG_DATA = {
    1: {
        title: "Top 10 Benefits of Organic Food for Your Health",
        content: `
            <p class="mb-6">Start considering the overwhelming evidence: switching to organic food is one of the single most impactful choices you can make for your health and the environment. But why exactly is it better?</p>
            
            <h3 class="text-2xl font-bold text-gray-900 mb-4">1. Fewer Pesticides</h3>
            <p class="mb-6">Conventionally grown produce is often sprayed with synthetic pesticides, herbicides, and fungicides. These chemicals can remain on the food even after washing. Organic farming prohibits these substances, ensuring your food is cleaner.</p>
            
            <h3 class="text-2xl font-bold text-gray-900 mb-4">2. More Nutrients</h3>
            <p class="mb-6">Studies have shown that organic fruits and vegetables can contain higher levels of antioxidants and essential vitamins. This is partly because organic plants have to develop their own defense mechanisms against pests, which leads to higher concentrations of beneficial compounds.</p>
            
            <h3 class="text-2xl font-bold text-gray-900 mb-4">3. No GMOs</h3>
            <p class="mb-6">Genetically Modified Organisms (GMOs) are strictly prohibited in organic farming. When you buy organic, you can be sure that your food hasn't been genetically engineered.</p>

            <div class="bg-green-50 border-l-4 border-primary p-6 rounded-r-xl my-8">
                <p class="text-green-800 font-medium italic">"Every time you buy organic, you're persuading more farmers to grow organic."</p>
            </div>

            <p class="mb-6">Making the switch doesn't have to be all or nothing. Start with the "Dirty Dozen"—foods that typically have the highest pesticide residues, like strawberries, spinach, and apples.</p>
        `,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        author: "Sarah Johnson",
        date: "Oct 24, 2024",
        category: "Health & Wellness",
        readTime: "5 min read"
    },
    2: {
        title: "Sustainability in 2024: Reducing Your Carbon Footprint",
        content: "<p>Content for sustainability article...</p>",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        author: "Michael Chen",
        date: "Oct 20, 2024",
        category: "Sustainability",
        readTime: "4 min read"
    },
    3: {
        title: "5 Quick & Easy Vegan Recipes for Busy Weeknights",
        content: "<p>Content for vegan recipes...</p>",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
        author: "Emma Davis",
        date: "Oct 15, 2024",
        category: "Recipes",
        readTime: "8 min read"
    }
};

const BlogPost = () => {
    const { id } = useParams();
    const post = BLOG_DATA[id];

    if (!post) return <div className="text-center pt-40">Post not found</div>;

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            {/* Scroll Progress Bar (Simplified Visual) */}
            <div className="fixed top-0 left-0 h-1 bg-green-100 w-full z-50">
                <div className="h-full bg-primary w-1/3"></div>
            </div>

            <article className="max-w-4xl mx-auto px-6 md:px-12">
                <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 transition font-medium group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </Link>

                <div className="mb-10">
                    <div className="flex gap-4 items-center mb-6">
                        <span className="bg-green-50 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            {post.category}
                        </span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Clock size={14} /> {post.readTime}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-y border-gray-100 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                <User size={20} className="text-gray-500" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{post.author}</p>
                                <div className="flex text-xs text-gray-500 font-medium">
                                    <span>{post.date}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition">
                                <Twitter size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#0A66C2] hover:border-[#0A66C2] transition">
                                <Linkedin size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl overflow-hidden mb-12 shadow-lg">
                    <img src={post.image} alt={post.title} className="w-full h-[400px] md:h-[500px] object-cover" />
                </div>

                <div
                    className="prose prose-lg prose-green max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tag Cloud & Bottom Share */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Tags</h4>
                    <div className="flex gap-2 mb-12">
                        {['Organic', 'Lifestyle', 'Healthy'].map(tag => (
                            <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 cursor-pointer transition">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
