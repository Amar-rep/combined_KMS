import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:8083';

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password, role }, { rejectWithValue }) => {
        try {
            const endpoint = role === 'doctor'
                ? `${API_BASE}/auth/doctor/login`
                : `${API_BASE}/auth/patient/login`;

            const response = await axios.post(endpoint, { email, password });
            return { user: response.data, role };
        } catch (error) {
            if (error.response && error.response.status === 401) {
                return rejectWithValue('Invalid email or password');
            }
            return rejectWithValue(
                error.response?.data || 'Something went wrong. Please try again.'
            );
        }
    }
);

const initialState = {
    user: null,
    role: null, // 'patient' | 'doctor'
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.role = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
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
                state.user = action.payload.user;
                state.role = action.payload.role;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectRole = (state) => state.auth.role;
export const selectAuthError = (state) => state.auth.error;
export const selectLoading = (state) => state.auth.loading;

export default authSlice.reducer;
