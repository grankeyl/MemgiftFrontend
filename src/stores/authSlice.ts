import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
    token: string | null;
    user: any;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: null,
    user: {},
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
        
            Cookies.set("token", action.payload.token, { expires: 8 });
        },
        loginError: (state) => {
            state.token = null;
            state.isAuthenticated = false;
        }
    },
});

export const { loginSuccess, loginError } = authSlice.actions;
export const authReducer = authSlice.reducer;