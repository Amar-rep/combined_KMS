import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Mock data for patients visible to the doctor
    patients: [
        { id: 'p1', name: 'Swalih edapal', email: 'john.doe@example.com' },
        { id: 'p2', name: 'Hanoon ', email: 'jane.smith@example.com' },
        { id: 'p3', name: 'Vijay ', email: 'Vijayj@example.com' },
    ],
    loading: false,
    error: null,
};

const patientsSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        setPatients: (state, action) => {
            state.patients = action.payload;
        },
    },
});

export const { setPatients } = patientsSlice.actions;

export const selectAllPatients = (state) => state.patients.patients;

export default patientsSlice.reducer;
