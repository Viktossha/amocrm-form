import {configureStore, type ThunkDispatch, type UnknownAction} from "@reduxjs/toolkit";
import {leadReducer, leadSlice} from "./leadSlice.ts";

export const store = configureStore({
    reducer: {
        [leadSlice.name]: leadReducer
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>

// @ts-ignore
window.store = store