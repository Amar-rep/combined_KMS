import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Mock data for groups owned by the patient
    groups: [
        {
            id: 'g1',
            name: 'Cardiology Records',
            ownerId: 'p1',
            records: [
                { id: 'r1', name: 'Heart Scan 2023', date: '2023-01-15' },
                { id: 'r2', name: 'Blood Test Results', date: '2023-02-20' },
            ]
        },
        {
            id: 'g2',
            name: 'General Checkups',
            ownerId: 'p1',
            records: [
                { id: 'r3', name: 'Annual Physical', date: '2022-12-10' },
            ]
        }
    ],
    loading: false,
    error: null,
};

const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
    },
});

export const { setGroups } = groupsSlice.actions;

export const selectGroups = (state) => state.groups.groups;

export default groupsSlice.reducer;
