import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunk for login
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/auth/google', { credential });
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Google Login failed');
    }
});

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        }
    }
);

// Async thunk to load user (check auth session)
export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/auth/me');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Session expired or invalid');
        }
    }
);

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Optional: Manual set user if needed
        setUser: (state, action) => {
            state.user = action.payload;
        },
        addAddress: (state, action) => {
            if (state.user) {
                if (!state.user.addresses) {
                    state.user.addresses = [];
                }
                state.user.addresses.push(action.payload);
                // Update local storage to keep it in sync
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                localStorage.removeItem('user');
            })
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                localStorage.removeItem('user');
            });
    },
});

export const { setUser, addAddress } = authSlice.actions;
export default authSlice.reducer;
