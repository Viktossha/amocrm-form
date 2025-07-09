import {asyncThunkCreator, buildCreateSlice} from "@reduxjs/toolkit";
import axios from "axios";
import type {Inputs} from "../ui/Form.tsx";

const createSliceWithThunks = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })

export const leadSlice = createSliceWithThunks({
    name: 'lead',
    initialState: {loading: false, error: null as string | null},
    reducers: (create) => {
        const createAThunk = create.asyncThunk.withTypes<{ rejectValue: null }>()
        return {
            sendLead: createAThunk(
                async (data: Inputs, {rejectWithValue}) => {
                    try {
                        const res = await axios.post(`${import.meta.env.VITE_API_URL}/lead.php`, data)
                        return res.status

                    } catch (error) {
                        return rejectWithValue(null)
                    }
                },
                {
                    fulfilled: (state) => {
                        state.loading = false
                    },
                    pending: (state) => {
                        state.loading = true
                    },
                    rejected: (state) => {
                        state.loading = false;
                        state.error = 'Ошибка при отправке';
                    }
                }
            ),
        }
    },
    selectors: {
        selectIsLoading: (state) => state.loading,
    }
})

export const leadReducer = leadSlice.reducer
export const { sendLead} = leadSlice.actions
export const { selectIsLoading } = leadSlice.selectors