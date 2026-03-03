import { createSlice } from '@reduxjs/toolkit';

// Mock Users
const MOCK_USERS = {
    patient: {
        username: 'patient1',
        password: 'password', // In a real app, never store passwords like this!
        role: 'patient',
        id: 'p1',
        name: 'John Doe',
        email: 'john.doe@example.com'
    },
    doctor: {
        username: 'doctor1',
        password: 'password',
        role: 'doctor',
        id: 'd1',
        name: 'Dr. Smith',
        specialty: 'Cardiology'
    }
};

const initialState = {
    user: null,
    role: null, // 'patient' | 'doctor'
    isAuthenticated: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            const { username, password, role } = action.payload;

            // Mock validation
            // We check if the provided role matches the requested role for login
            const mockUser = Object.values(MOCK_USERS).find(
                (u) => u.username === username && u.password === password && u.role === role
            );

            if (mockUser) {
                state.user = mockUser;
                state.role = mockUser.role;
                state.isAuthenticated = true;
                state.error = null;
            } else {
                state.error = 'Invalid credentials or role';
                state.isAuthenticated = false;
            }
        },
        logout: (state) => {
            state.user = null;
            state.role = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
});

export const { login, logout, clearError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectRole = (state) => state.auth.role;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
