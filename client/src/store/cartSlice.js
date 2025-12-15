import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutUser } from './authSlice';
import API_URL from '../config';

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/api/cart`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch cart');
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async (item, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            if (!user) {
                return { local: true, item }; // Signal to use local logic
            }

            const res = await fetch(`${API_URL}/api/cart/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    productId: item._id,
                    quantity: item.quantity || 1,
                    variant: item.variant // Pass variant (weight, price)
                })
            });
            if (!res.ok) throw new Error('Failed to add to cart');
            return await res.json(); // Returns backend cart
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateQuantityAsync = createAsyncThunk(
    'cart/updateQuantityAsync',
    async ({ id, quantity, weight }, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            if (!user) return { local: true, id, quantity, weight };

            const res = await fetch(`${API_URL}/api/cart/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId: id, quantity, weight })
            });
            if (!res.ok) throw new Error('Failed to update cart');
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async ({ id, weight }, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            if (!user) return { local: true, id, weight };

            const res = await fetch(`${API_URL}/api/cart/${id}?weight=${weight}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to remove item');
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Helper to calculate totals
const calculateTotals = (state) => {
    state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
    // Use variant price if available, else item price
    state.totalAmount = state.items.reduce((total, item) => {
        const price = item.variant ? item.variant.price : item.price;
        return total + price * item.quantity;
    }, 0);
    localStorage.setItem('cartItems', JSON.stringify(state.items));
};

// Safe localStorage loader
const loadCartFromStorage = () => {
    try {
        const stored = localStorage.getItem('cartItems');
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(item => item && item._id && typeof item.price === 'number');
    } catch (e) {
        console.error("Failed to load cart from storage", e);
        return [];
    }
};

// Start initialState
const initialState = {
    items: loadCartFromStorage(),
    totalQuantity: 0,
    totalAmount: 0,
    loading: false,
    error: null
};

// Recalculate initially
try {
    if (initialState.items.length > 0) {
        initialState.totalQuantity = initialState.items.reduce((total, item) => total + (item.quantity || 0), 0);
        initialState.totalAmount = initialState.items.reduce((total, item) => {
            const price = item.variant ? item.variant.price : (item.price || 0);
            return total + price * (item.quantity || 0);
        }, 0);
    }
} catch (e) {
    console.error("Error calculating initial totals", e);
    initialState.items = [];
    initialState.totalQuantity = 0;
    initialState.totalAmount = 0;
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const newItem = action.payload; // expects { _id, variant: {weight, price}, ... }
            const existingItem = state.items.find(item =>
                item._id === newItem._id && item.variant?.weight === newItem.variant?.weight
            );

            if (!existingItem) {
                state.items.push({
                    _id: newItem._id,
                    name: newItem.name,
                    price: newItem.price, // Base/Display Price
                    variant: newItem.variant, // { weight, price }
                    image: newItem.image,
                    quantity: newItem.quantity || 1,
                });
            } else {
                existingItem.quantity += (newItem.quantity || 1);
            }
            calculateTotals(state);
        },
        removeFromCart(state, action) {
            const { id, weight } = action.payload; // Expects object now if local
            state.items = state.items.filter(item =>
                !(item._id === id && item.variant?.weight === weight)
            );
            calculateTotals(state);
        },
        updateQuantity(state, action) {
            const { id, quantity, weight } = action.payload;
            const item = state.items.find(item =>
                item._id === id && item.variant?.weight === weight
            );
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    state.items = state.items.filter(i =>
                        !(i._id === id && i.variant?.weight === weight)
                    );
                }
            }
            calculateTotals(state);
        },
        clearCart(state) {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            localStorage.removeItem('cartItems');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.items = [];
                state.totalQuantity = 0;
                state.totalAmount = 0;
                localStorage.removeItem('cartItems');
            })
            // Fetch Cart
            .addCase(fetchCart.fulfilled, (state, action) => {
                if (action.payload && action.payload.items) {
                    state.items = action.payload.items
                        .filter(i => i.product)
                        .map(i => ({
                            ...i.product,
                            _id: i.product._id,
                            quantity: i.quantity,
                            variant: i.variant // Includes weight, price
                        }));
                } else {
                    state.items = [];
                }
                calculateTotals(state);
            })
            // Add (Sync)
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                if (action.payload.local) {
                    const newItem = action.payload.item;
                    const existingItem = state.items.find(item =>
                        item._id === newItem._id && item.variant?.weight === newItem.variant?.weight
                    );
                    if (!existingItem) {
                        state.items.push({
                            _id: newItem._id,
                            name: newItem.name,
                            price: newItem.price,
                            variant: newItem.variant,
                            image: newItem.image,
                            quantity: newItem.quantity || 1,
                        });
                    } else {
                        existingItem.quantity += (newItem.quantity || 1);
                    }
                } else {
                    if (action.payload.items) {
                        state.items = action.payload.items
                            .filter(i => i.product)
                            .map(i => ({
                                ...i.product,
                                _id: i.product._id,
                                quantity: i.quantity,
                                variant: i.variant
                            }));
                    }
                }
                calculateTotals(state);
            })
            // Update Quantity
            .addCase(updateQuantityAsync.fulfilled, (state, action) => {
                if (action.payload.local) {
                    const { id, quantity, weight } = action.payload;
                    const item = state.items.find(item =>
                        item._id === id && item.variant?.weight === weight
                    );
                    if (item) {
                        item.quantity = quantity;
                        if (item.quantity <= 0) {
                            state.items = state.items.filter(i =>
                                !(i._id === id && i.variant?.weight === weight)
                            );
                        }
                    }
                } else {
                    if (action.payload.items) {
                        state.items = action.payload.items
                            .filter(i => i.product)
                            .map(i => ({
                                ...i.product,
                                _id: i.product._id,
                                quantity: i.quantity,
                                variant: i.variant
                            }));
                    }
                }
                calculateTotals(state);
            })
            // Remove
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                if (action.payload.local) {
                    const { id, weight } = action.payload;
                    state.items = state.items.filter(item =>
                        !(item._id === id && item.variant?.weight === weight)
                    );
                } else {
                    if (action.payload.items) {
                        state.items = action.payload.items
                            .filter(i => i.product)
                            .map(i => ({
                                ...i.product,
                                _id: i.product._id,
                                quantity: i.quantity,
                                variant: i.variant
                            }));
                    }
                }
                calculateTotals(state);
            });
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
