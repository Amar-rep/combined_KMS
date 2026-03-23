import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE = 'http://localhost:8083';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const createGroup = createAsyncThunk(
    'groups/createGroup',
    async ({ name, userIdKeccak }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE}/api/hospital/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, userIdKeccak }),
            });
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchGroupById = createAsyncThunk(
    'groups/fetchGroupById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE}/api/hospital/groups/${id}`);
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchGroupByGroupId = createAsyncThunk(
    'groups/fetchGroupByGroupId',
    async (groupId, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE}/api/hospital/groups/group-id/${groupId}`);
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchGroupsByUser = createAsyncThunk(
    'groups/fetchGroupsByUser',
    async (userIdKeccak, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE}/api/hospital/groups/user/${userIdKeccak}`);
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAllGroups = createAsyncThunk(
    'groups/fetchAllGroups',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE}/api/hospital/groups`);
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
    groups: [],
    selectedGroup: null,
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
        clearSelectedGroup: (state) => {
            state.selectedGroup = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Helper to reduce boilerplate for the loading/error pattern
        const pending  = (state)          => { state.loading = true;  state.error = null; };
        const rejected = (state, action)  => { state.loading = false; state.error = action.payload; };

        builder
            // createGroup
            .addCase(createGroup.pending, pending)
            .addCase(createGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.groups.push(action.payload);   // append the newly created group
            })
            .addCase(createGroup.rejected, rejected)

            // fetchGroupById
            .addCase(fetchGroupById.pending, pending)
            .addCase(fetchGroupById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedGroup = action.payload;
            })
            .addCase(fetchGroupById.rejected, rejected)

            // fetchGroupByGroupId
            .addCase(fetchGroupByGroupId.pending, pending)
            .addCase(fetchGroupByGroupId.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedGroup = action.payload;
            })
            .addCase(fetchGroupByGroupId.rejected, rejected)

            // fetchGroupsByUser
            .addCase(fetchGroupsByUser.pending, pending)
            .addCase(fetchGroupsByUser.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroupsByUser.rejected, rejected)

            // fetchAllGroups
            .addCase(fetchAllGroups.pending, pending)
            .addCase(fetchAllGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
            })
            .addCase(fetchAllGroups.rejected, rejected);
    },
});

export const { setGroups, clearSelectedGroup, clearError } = groupsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectGroups        = (state) => state.groups.groups;
export const selectSelectedGroup = (state) => state.groups.selectedGroup;
export const selectGroupsLoading = (state) => state.groups.loading;
export const selectGroupsError   = (state) => state.groups.error;

export default groupsSlice.reducer;