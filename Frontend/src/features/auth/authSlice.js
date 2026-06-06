import { createSlice } from '@reduxjs/toolkit';

const AuthSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.loading = false;
        },
        updateSellerProfile: (state, action) => {
            if (state.user) {
                state.user.isSeller = true;
                state.user.sellerProfile = action.payload;
            }
        }
    }
});

export const { setUser, setLoading, setError, logout, updateSellerProfile } = AuthSlice.actions;

export default AuthSlice.reducer;