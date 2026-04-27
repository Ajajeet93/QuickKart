import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api'; // use axios instance so the refresh interceptor fires on 401

// ── Login ──────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/admin/login', userData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// ── Logout ─────────────────────────────────────────────────────────
// Calls /api/admin/logout → server deletes refresh token from DB + clears both cookies
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/api/admin/logout');
        } catch (error) {
            console.error('Logout error', error);
        }
    }
);

// ── Load User (re-hydrate from JWT cookie on app mount) ────────────
// Uses api.js (axios) so the refresh interceptor can silently refresh
// the access token if it has expired — admin stays logged in seamlessly.
export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/admin/me');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Session expired or invalid');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────
const initialState = {
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        addAddress: (state, action) => {
            if (state.user) {
                if (!state.user.addresses) state.user.addresses = [];
                state.user.addresses.push(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending,  (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(loginUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(logoutUser.fulfilled, (state) => { state.user = null; })

            .addCase(loadUser.pending,   (state) => { state.loading = true; })
            .addCase(loadUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(loadUser.rejected,  (state) => { state.loading = false; state.user = null; });
    },
});

export const { setUser, addAddress } = authSlice.actions;
export default authSlice.reducer;
