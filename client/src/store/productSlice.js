import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunk to fetch products with caching
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params, { rejectWithValue, getState }) => {
        try {
            let url = '/api/products';
            const query = new URLSearchParams();

            // Handle params
            if (typeof params === 'string') {
                query.append('categoryId', params);
            } else if (typeof params === 'object' && params !== null) {
                if (params.categoryId) query.append('categoryId', params.categoryId);
                if (params.category) query.append('category', params.category);
                if (params.search) query.append('search', params.search);
                if (params.page) query.append('page', params.page);
                if (params.limit) query.append('limit', params.limit);
            }

            const queryString = query.toString();
            // Create a unique cache key based on the query params
            const cacheKey = queryString || 'all';

            // Check if data is already in cache and fresh (valid for 5 minutes)
            const { products: { cache } } = getState();
            const cachedData = cache[cacheKey];
            const now = Date.now();

            if (cachedData && (now - cachedData.timestamp < 5 * 60 * 1000)) {
                // Return cached data immediately
                return { ...cachedData.data, fromCache: true, cacheKey };
            }

            if (queryString) url += `?${queryString}`;

            const response = await api.get(url);
            return { ...response.data, cacheKey }; // Pass cacheKey to save it
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

// Async thunk to fetch single product details
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/products/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
        }
    }
);

const initialState = {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
    total: 0,
    cache: {} // { [cacheKey]: { data: payload, timestamp: number } }
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearProductCache: (state) => {
            state.cache = {};
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                const { products, page, pages, total, cacheKey, fromCache } = action.payload;

                if (page === 1) {
                    state.items = products;
                } else {
                    state.items = [...state.items, ...products];
                }

                state.page = page;
                state.total = total;
                state.hasMore = page < pages;

                // Cache the result if it's not from cache
                if (!fromCache && cacheKey) {
                    state.cache[cacheKey] = {
                        data: { products, page, pages, total },
                        timestamp: Date.now()
                    };
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProductCache, clearSelectedProduct } = productSlice.actions;

export default productSlice.reducer;
