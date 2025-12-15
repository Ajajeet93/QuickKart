import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutUser } from './authSlice';
import API_URL from '../config';

// Fetch Addresses
export const fetchAddresses = createAsyncThunk(
    'addresses/fetchAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/api/user/addresses`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                return rejectWithValue('Failed to fetch addresses');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Add Address
export const addNewAddress = createAsyncThunk(
    'addresses/addNewAddress',
    async (addressData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/api/user/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(addressData)
            });

            if (!response.ok) {
                return rejectWithValue('Failed to add address');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update Address
export const updateAddress = createAsyncThunk(
    'addresses/updateAddress',
    async ({ id, addressData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/api/user/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(addressData)
            });

            if (!response.ok) {
                return rejectWithValue('Failed to update address');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete Address
export const deleteAddress = createAsyncThunk(
    'addresses/deleteAddress',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/api/user/addresses/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                return rejectWithValue('Failed to delete address');
            }

            return id; // Return ID to remove from state
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    list: [],
    selectedId: null, // Track selected address ID
    loading: false,
    error: null,
};

const addressSlice = createSlice({
    name: 'addresses',
    initialState,
    reducers: {
        selectAddress: (state, action) => {
            state.selectedId = action.payload;
        },
        clearAddresses: (state) => {
            state.list = [];
            state.selectedId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Clear items on logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.list = [];
                state.selectedId = null;
                state.loading = false;
                state.error = null;
            })
            // Fetch All
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
                // Auto-select first address if none selected and list has items
                if (!state.selectedId && action.payload.length > 0) {
                    state.selectedId = action.payload[0]._id;
                }
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add New
            .addCase(addNewAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addNewAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.list.push(action.payload);
                // Auto-select newly added address
                state.selectedId = action.payload._id;
            })
            .addCase(addNewAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.list.findIndex(addr => addr._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter(addr => addr._id !== action.payload);
                if (state.selectedId === action.payload) {
                    state.selectedId = state.list.length > 0 ? state.list[0]._id : null;
                }
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { selectAddress, clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
