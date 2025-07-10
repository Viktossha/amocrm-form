import * as React from "react"
import Snackbar, {type SnackbarCloseReason} from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import {useSelector} from "react-redux";
import {selectError, setError} from "./leadSlice.ts";
import {useAppDispatch} from "./Form.tsx";

export const ErrorSnackbar = () => {
  const error = useSelector(selectError)
  const dispatch = useAppDispatch()

  const handleClose = (__event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return
    }
    dispatch(setError({ error: null }))
  }

  return (
    <Snackbar open={error !== null} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" variant="standard" sx={{ width: "100%" }}>
        {error}
      </Alert>
    </Snackbar>
  )
}
