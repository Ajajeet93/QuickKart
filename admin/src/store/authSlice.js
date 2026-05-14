import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// ── Login ──────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/v1/admin/login', userData);
            // Server returns: { success, message, data: { user } }
            return response.data.data?.user ?? response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// ── Logout ─────────────────────────────────────────────────────────
// Logout is a public route — does NOT require a valid access token.
// The server reads the admin_refresh_token cookie directly to revoke the session.
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        try {
            // Suppress errors — if the server is unreachable, still clear local state
            await api.post('/api/v1/admin/logout');
        } catch {
            // Silently swallow — local state will still be cleared in the reducer
        }
    }
);

// ── Load User (re-hydrate from JWT cookie on app mount) ────────────
// Uses api.js (axios) so the refresh interceptor can silently refresh
// the access token if it has expired — admin stays logged in seamlessly.
// Returns null (not rejected) when no session exists — not an error.
export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/v1/admin/me');
            // Server returns: { success, message, data: <user> }
            return response.data.data ?? response.data.user ?? null;
        } catch (error) {
            // 401 = no session. This is normal on a fresh visit — reject silently.
            return rejectWithValue(null);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────
const initialState = {
    user:    null,
    loading: false,
    error:   null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user  = null;
            state.error = null;
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
            .addCase(loginUser.pending,   (state) => { state.loading = true;  state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(loginUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

            // Logout always clears local state regardless of server response
            .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.error = null; })
            .addCase(logoutUser.rejected,  (state) => { state.user = null; state.error = null; })

            // loadUser — silent on 401 (user is simply not logged in)
            .addCase(loadUser.pending,   (state) => { state.loading = true; })
            .addCase(loadUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(loadUser.rejected,  (state) => { state.loading = false; state.user = null; });
    },
});

export const { setUser, clearUser, addAddress } = authSlice.actions;
export default authSlice.reducer;
