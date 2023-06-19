import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => ({
                url: 'users',
                method: 'GET',
                credentials: 'include',
            }),
        }),
    }),
});

export const { useGetUsersQuery } = apiSlice;
