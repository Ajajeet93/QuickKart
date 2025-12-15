import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API_URL from '../config';

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/api/products`;
            const query = new URLSearchParams();

            // Handle params: can be string (ID) or object { categoryId, category }
            if (typeof params === 'string') {
                query.append('categoryId', params);
            } else if (typeof params === 'object' && params !== null) {
                if (params.categoryId) query.append('categoryId', params.categoryId);
                if (params.category) query.append('category', params.category);
                if (params.page) query.append('page', params.page);
                if (params.limit) query.append('limit', params.limit);
            }

            const queryString = query.toString();
            if (queryString) url += `?${queryString}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to fetch single product details
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
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
    total: 0
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                const { products, page, pages, total } = action.payload;

                if (page === 1) {
                    state.items = products;
                } else {
                    state.items = [...state.items, ...products];
                }

                state.page = page;
                state.total = total;
                state.hasMore = page < pages;
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

export default productSlice.reducer;
