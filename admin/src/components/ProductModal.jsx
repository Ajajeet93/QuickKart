import React, { useState, useEffect } from 'react';
import api from '../api';
import { X, Check, Plus, Trash2, Package, Star, AlertTriangle, Loader2, Layers, Image as ImgIcon, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INP = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white outline-none transition-all";
const Lbl = ({ children, hint, req }) => (
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {children}{req && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="ml-1.5 font-normal normal-case text-gray-400">{hint}</span>}
    </label>
);
const Stars = ({ v }) => (
    <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(i=>(
        <Star key={i} size={12} className={i<=Math.round(parseFloat(v)||0)?'fill-amber-400 text-amber-400':'fill-gray-200 text-gray-200'}/>
    ))}</div>
);

const STEPS = [
    { id:1, label:'Basic Info',  icon:'📦', desc:'Name, description, category' },
    { id:2, label:'Pricing',     icon:'💰', desc:'Price, stock, popular flag' },
    { id:3, label:'Images',      icon:'🖼️', desc:'Main image & gallery' },
    { id:4, label:'Variants',    icon:'⚖️', desc:'Weight/size options' },
];

const ProductModal = ({ editing, categories, onClose, onSaved }) => {
    const blank = { name:'', price:'', description:'', categoryId:'', image:'', images:[], stock:'100', isPopular:false, rating:'0', variants:[] };
    const [form, setForm] = useState(blank);
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newImg, setNewImg] = useState('');

    useEffect(() => {
        setStep(1);
        setError('');
        if (editing) setForm({
            name: editing.name||'', price: editing.price||'', description: editing.description||'',
            categoryId: editing.categoryId?._id||editing.categoryId||'', image: editing.image||'',
            images: editing.images||[], stock: editing.stock??100, isPopular: editing.isPopular||false,
            rating: editing.rating||0, variants: editing.variants||[],
        });
        else setForm(blank);
    }, [editing]);

    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const addImg = () => { const u=newImg.trim(); if(!u)return; set('images',[...form.images,u]); setNewImg(''); };
    const addVariant = () => set('variants',[...form.variants,{weight:'',price:''}]);
    const removeVariant = i => set('variants',form.variants.filter((_,idx)=>idx!==i));
    const setV = (i,k,v) => { const a=[...form.variants]; a[i]={...a[i],[k]:v}; set('variants',a); };

    const validateStep = () => {
        setError('');
        if (step===1 && !form.name.trim()) return setError('Product name is required.'), false;
        if (step===1 && !form.categoryId)  return setError('Please select a category.'), false;
        if (step===2 && !form.price)        return setError('Base price is required.'), false;
        return true;
    };

    const next = () => { if (validateStep()) setStep(s=>Math.min(s+1,4)); };
    const back = () => { setError(''); setStep(s=>Math.max(s-1,1)); };

    const submit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;
        setSaving(true); setError('');
        try {
            const cat = categories.find(c=>c._id===form.categoryId);
            const payload = { ...form, price:parseFloat(form.price), stock:parseInt(form.stock),
                rating:parseFloat(form.rating)||0, category:cat?.name||'Uncategorized',
                variants:form.variants.filter(v=>v.weight&&v.price).map(v=>({...v,price:parseFloat(v.price)})) };
            if (editing) await api.put(`/api/v1/products/${editing._id}`, payload);
            else         await api.post('/api/v1/products', payload);
            onSaved(editing?'Product updated!':'Product created!');
            onClose();
        } catch(err) { setError(err.response?.data?.message||'Failed to save.'); }
        finally { setSaving(false); }
    };

    const stockVal = parseInt(form.stock)||0;
    const cat = categories.find(c=>c._id===form.categoryId);

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            style={{backdropFilter:'blur(4px)'}} onClick={onClose}>
            <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.97}}
                transition={{type:'spring',damping:28,stiffness:280}}
                className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{maxHeight:'calc(100vh - 48px)'}}
                onClick={e=>e.stopPropagation()}>

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-7 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Package size={20} className="text-emerald-600"/>
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">{editing?'Edit Product':'Add New Product'}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Step {step} of {STEPS.length} — {STEPS[step-1].label}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"><X size={18}/></button>
                </div>

                {/* Step progress */}
                <div className="flex-shrink-0 px-7 pt-5 pb-2">
                    <div className="flex items-center gap-0">
                        {STEPS.map((s,i)=>(
                            <React.Fragment key={s.id}>
                                <button type="button" onClick={()=>{ if(s.id<step) setStep(s.id); }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all
                                        ${step===s.id?'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200':
                                          s.id<step?'text-emerald-600 cursor-pointer hover:bg-emerald-50':'text-gray-300 cursor-default'}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold
                                        ${step===s.id?'bg-emerald-600 text-white':s.id<step?'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-400'}`}>
                                        {s.id<step?'✓':s.id}
                                    </span>
                                    <span className="hidden sm:block">{s.label}</span>
                                </button>
                                {i<STEPS.length-1 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${s.id<step?'bg-emerald-300':'bg-gray-100'}`}/>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-7 py-5">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                            <AlertTriangle size={14}/> {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
                            transition={{duration:0.18}} className="space-y-4">

                            {/* ── STEP 1: Basic Info ── */}
                            {step===1 && (<>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-2">
                                    <p className="text-sm font-bold text-emerald-800">📦 Basic Information</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Start with the core product details — name, category, and description.</p>
                                </div>
                                <div>
                                    <Lbl req>Product Name</Lbl>
                                    <input className={INP} required placeholder="e.g. Organic Bananas"
                                        value={form.name} onChange={e=>set('name',e.target.value)}/>
                                </div>
                                <div>
                                    <Lbl>Description</Lbl>
                                    <textarea className={`${INP} min-h-[90px] resize-none`}
                                        placeholder="What makes this product stand out?"
                                        value={form.description} onChange={e=>set('description',e.target.value)}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl req>Category</Lbl>
                                        <select className={INP} value={form.categoryId} onChange={e=>set('categoryId',e.target.value)}>
                                            <option value="">Select…</option>
                                            {categories.map(c=><option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Lbl hint="0–5">Rating</Lbl>
                                        <input className={INP} type="number" min="0" max="5" step="0.1" placeholder="4.5"
                                            value={form.rating} onChange={e=>set('rating',e.target.value)}/>
                                        <Stars v={form.rating}/>
                                    </div>
                                </div>
                            </>)}

                            {/* ── STEP 2: Pricing ── */}
                            {step===2 && (<>
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-2">
                                    <p className="text-sm font-bold text-blue-800">💰 Pricing & Inventory</p>
                                    <p className="text-xs text-blue-600 mt-0.5">Set your product price, manage stock level, and highlight popular items.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl req>Base Price (₹)</Lbl>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                                            <input className={`${INP} pl-7`} type="number" min="0" step="0.01" placeholder="0.00"
                                                value={form.price} onChange={e=>set('price',e.target.value)}/>
                                        </div>
                                    </div>
                                    <div>
                                        <Lbl req>Stock Quantity</Lbl>
                                        <input className={INP} type="number" min="0" placeholder="100"
                                            value={form.stock} onChange={e=>set('stock',e.target.value)}/>
                                    </div>
                                </div>
                                {/* Stock bar */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-400 font-medium">Stock level indicator</span>
                                        <span className={`font-bold ${stockVal>20?'text-emerald-600':stockVal>0?'text-amber-600':'text-red-600'}`}>
                                            {stockVal>20?'✓ Healthy':stockVal>0?'⚠ Low Stock':'✗ Out of Stock'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500"
                                            style={{width:`${Math.min((stockVal/200)*100,100)}%`,
                                                backgroundColor:stockVal>20?'#0C831F':stockVal>0?'#f59e0b':'#ef4444'}}/>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">{stockVal} units available</p>
                                </div>
                                {/* Popular toggle */}
                                <label className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Star size={18} className="text-amber-500 fill-amber-400"/>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Mark as Popular</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Shown on homepage and featured sections</p>
                                        </div>
                                    </div>
                                    <div onClick={()=>set('isPopular',!form.isPopular)}
                                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.isPopular?'bg-emerald-500':'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPopular?'translate-x-7':'translate-x-1'}`}/>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={form.isPopular} readOnly/>
                                </label>
                            </>)}

                            {/* ── STEP 3: Images ── */}
                            {step===3 && (<>
                                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-2">
                                    <p className="text-sm font-bold text-violet-800">🖼️ Product Images</p>
                                    <p className="text-xs text-violet-600 mt-0.5">Add a main product image and an optional gallery for the detail page.</p>
                                </div>
                                <div>
                                    <Lbl>Main Image URL</Lbl>
                                    <input className={INP} type="url" placeholder="https://example.com/image.jpg"
                                        value={form.image} onChange={e=>set('image',e.target.value)}/>
                                    {form.image && (
                                        <img src={form.image} alt="" className="mt-3 w-full h-44 object-cover rounded-2xl border border-gray-200"
                                            onError={e=>{e.target.style.display='none';}}/>
                                    )}
                                </div>
                                <div>
                                    <Lbl>Gallery Images</Lbl>
                                    <div className="flex gap-2">
                                        <input className={`${INP} flex-1`} type="url" placeholder="Paste URL and press Add"
                                            value={newImg} onChange={e=>setNewImg(e.target.value)}
                                            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addImg();}}}/>
                                        <button type="button" onClick={addImg}
                                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0">
                                            <Plus size={14}/> Add
                                        </button>
                                    </div>
                                    {form.images.length>0 ? (
                                        <div className="grid grid-cols-4 gap-2 mt-3">
                                            {form.images.map((url,i)=>(
                                                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={url} alt="" className="w-full h-full object-cover" onError={e=>{e.target.style.opacity='0.2';}}/>
                                                    <button type="button" onClick={()=>set('images',form.images.filter((_,idx)=>idx!==i))}
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                    <span className="absolute bottom-1 left-1 bg-black/40 text-white text-[9px] px-1 py-0.5 rounded">{i+1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic mt-2">No gallery images added yet.</p>
                                    )}
                                </div>
                            </>)}

                            {/* ── STEP 4: Variants ── */}
                            {step===4 && (<>
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-2">
                                    <p className="text-sm font-bold text-rose-800">⚖️ Weight / Size Variants</p>
                                    <p className="text-xs text-rose-600 mt-0.5">Optional — add different weight or size options, each with its own price.</p>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={addVariant}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors">
                                        <Plus size={15}/> Add Variant
                                    </button>
                                </div>
                                {form.variants.length===0 ? (
                                    <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                                        <Layers size={32} className="mx-auto mb-2 text-gray-300"/>
                                        <p className="text-sm font-medium">No variants yet</p>
                                        <p className="text-xs mt-1 text-gray-300">e.g. 250g → ₹30 &nbsp;·&nbsp; 500g → ₹55 &nbsp;·&nbsp; 1kg → ₹100</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">
                                            <span className="col-span-6">Weight / Size</span>
                                            <span className="col-span-5">Price (₹)</span>
                                        </div>
                                        {form.variants.map((v,i)=>(
                                            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2">
                                                <div className="col-span-6">
                                                    <input className={INP} placeholder="e.g. 500g"
                                                        value={v.weight} onChange={e=>setV(i,'weight',e.target.value)}/>
                                                </div>
                                                <div className="col-span-5 relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                                    <input className={`${INP} pl-7`} type="number" placeholder="0"
                                                        value={v.price} onChange={e=>setV(i,'price',e.target.value)}/>
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button type="button" onClick={()=>removeVariant(i)}
                                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-colors">
                                                        <Trash2 size={13}/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Review summary on last step */}
                                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Review Before Publishing</p>
                                    {[
                                        ['Product', form.name||'—'],
                                        ['Category', cat?.name||'—'],
                                        ['Price', form.price?`₹${form.price}`:'—'],
                                        ['Stock', `${form.stock||0} units`],
                                        ['Variants', form.variants.filter(v=>v.weight&&v.price).length],
                                        ['Gallery', `${form.images.length} image${form.images.length!==1?'s':''}`],
                                        ['Popular', form.isPopular?'Yes':'No'],
                                    ].map(([k,v])=>(
                                        <div key={k} className="flex justify-between text-sm">
                                            <span className="text-gray-400">{k}</span>
                                            <span className="font-semibold text-gray-800 truncate max-w-[180px] text-right">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </>)}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex items-center justify-between px-7 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        {step>1 && (
                            <button type="button" onClick={back}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium">
                                <ChevronLeft size={16}/> Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                            Cancel
                        </button>
                        {step<4 ? (
                            <button type="button" onClick={next}
                                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors">
                                Next <ChevronRight size={16}/>
                            </button>
                        ) : (
                            <button type="button" onClick={submit} disabled={saving}
                                className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-60">
                                {saving?<Loader2 size={15} className="animate-spin"/>:<Check size={15} strokeWidth={3}/>}
                                {editing?'Save Changes':'Publish Product'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductModal;
