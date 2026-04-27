import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// ── Register ───────────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/auth/register', userData);
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

// ── Login ──────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

// ── Google Login ───────────────────────────────────────────────────
export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/auth/google', { credential });
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Google Login failed');
    }
});

// ── Logout ─────────────────────────────────────────────────────────
// Calls POST /api/auth/logout → server deletes refresh token from DB + clears both cookies
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
    try {
        await api.post('/api/auth/logout');
    } catch (error) {
        console.error('Logout error', error);
    }
});

// ── Load User (re-hydrate on page refresh via access token) ────────
// The Axios interceptor will silently refresh the access token if expired.
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/api/auth/me');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Not authenticated');
    }
});

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
        setUser: (state, action) => { state.user = action.payload; },
        addAddress: (state, action) => {
            if (state.user) {
                if (!state.user.addresses) state.user.addresses = [];
                state.user.addresses.push(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending,    (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled,  (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(loginUser.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(registerUser.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(googleLogin.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(googleLogin.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(googleLogin.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(logoutUser.fulfilled, (state) => { state.user = null; })

            .addCase(loadUser.pending,   (state) => { state.loading = true; })
            .addCase(loadUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(loadUser.rejected,  (state) => { state.loading = false; state.user = null; });
    },
});

export const { setUser, addAddress } = authSlice.actions;
export default authSlice.reducer;
