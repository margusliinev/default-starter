import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './features/api/apiSlice';
import dataReducer from './features/data/dataSlice';

export const store = configureStore({
    reducer: {
        data: dataReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
