import {asyncThunkCreator, buildCreateSlice} from "@reduxjs/toolkit";
import axios from "axios";
import type {Inputs} from "../Form.tsx";

const createSliceWithThunks = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })

export const leadSlice = createSliceWithThunks({
    name: 'lead',
    initialState: {loading: false, error: null as string | null},
    reducers: (create) => {
        const createAThunk = create.asyncThunk.withTypes<{ rejectValue: null }>()
        return {
            sendLead: createAThunk(
                async (data: Inputs, {rejectWithValue, dispatch}) => {
                    try {
                        const res = await axios.post(`${import.meta.env.VITE_API_URL}/lead.php`, data)
                        return res.status

                    } catch (error) {
                        let message = 'Неизвестная ошибка'
                        if (axios.isAxiosError(error)) {
                            message = error.response?.data?.message || error.message || message
                        } else if (error instanceof Error) {
                            message = `Native error: ${error.message}`
                        } else {
                            message = JSON.stringify(error)
                        }
                        dispatch(setError({ error: message }))
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
                    }
                }
            ),
            setError: create.reducer<{ error: string | null }>((state, action) => {
                state.error = action.payload.error
            }),
        }
    },
    selectors: {
        selectIsLoading: (state) => state.loading,
        selectError: (state) => state.error,
    }
})

export const leadReducer = leadSlice.reducer
export const { sendLead, setError} = leadSlice.actions
export const { selectIsLoading, selectError } = leadSlice.selectors