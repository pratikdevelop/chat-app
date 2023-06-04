import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React from "react";
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CommonAlert = (props) => {
  return (
    <>
      <Snackbar
        open={props.data.open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={6000}
        onClose={() => {
          props.data.open = false;
        }}
      >
        <Alert
          onClose={() => {
            props.data.open = false;
          }}
          severity={props.data.variant}
          sx={{ width: "100%" }}
        >
          {props.data.message}
        </Alert>
      </Snackbar>
    </>
  );
};
