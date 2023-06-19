import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    showData: true,
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        toggleData: (state) => {
            state.showData = !state.showData;
        },
    },
});

export const { toggleData } = dataSlice.actions;
export default dataSlice.reducer;
