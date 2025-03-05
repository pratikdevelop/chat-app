import React, { useState } from "react";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import axios from "axios";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
const ResetPassword = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const url = process.env.REACT_APP_API_URL;

  const submit = () => {
    if (!email && !validator.isEmail(email)) {
      setEmailError("plase enter the validate email");
      return;
    }
    setEmailError('');
    setLoading(true);
    axios
      .post(url+"/reset-password", { email })
      .then((response) => {
        toast.success('We Will Send Otp in your email or mobile number,please check ', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setTimeout(() => {
          nav("/verify-otp");
        }, 6000);
      })
      .catch((error) => {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      });
  };

  const VerifyOtp = () => {
    if (!otp) {
      setEmailError("please enter the otp");
      return;
    }
    axios
      .post(url+"/verify-otp", { email, otp })
      .then((response) => {
        toast.success(response.data.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
        nav("/change-password/" + response.data.userId);
      })
      .catch((error) => {
        toast.error("This otp has been Expired, please retry again", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  return (
    <>
      <ToastContainer />
      <div className="reset-password">
          
            <form
              className=" form flex flex-col p-6 bg-white space-y-5 border-2 shadow-2xl border-white-200"
              method="post"
            >
              <h1 className="font-bold text-3xl text-center  text-gray-700 ">
                Reset your password
              </h1>
              <span className="text-gray-600 text-xl">
                Enter the email address associated with your account and we'll send
                you a link to reset your password. Lorem, ipsum dolor sit amet consectetur adipisicing elit. In architecto
              </span>
              <TextField
                className="flex-auto text-dark border-2"
                id="email"
                type="email"
                value={email}
                variant="standard"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email"
                label="Enter email"
              ></TextField>
              {emailError ? (
                <span
                  style={{
                    fontWeight: "bold",
                    color: "red",
                  }}
                >
                  {emailError}
                </span>
              ) : null}
              {location.pathname === "/verify-otp" ? (
                <>
                  <TextField
                    className="flex-auto text-dark border-2"
                    id="otp"
                    value={otp}
                    variant="standard"
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter otp"
                    label="Enter otp"
                  ></TextField>
                  {emailError ? (
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "red",
                      }}
                    >
                      {emailError}
                    </span>
                  ) : null}

                  <div className="flex  justify-between items-center cursor-pointer">
                    <Button
                      type="button"
                      variant="contained"
                      className="p-2 ml-auto"
                      color="primary"
                    >
                      {" "}
                      ReSend Otp
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      onClick={VerifyOtp}
                      className="p-2 ml-auto"
                      color="primary"
                    >
                      Send Otp
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col cursor-pointer">
                  
                  <button
                    type="button"
                    disabled={loading}
                    onClick={submit}
                    className=" p-3 text-dark hue-rotate-15 antialiased bg-indigo-500 stacked-fractions shadow-lg shadow-indigo-500/50"
                  >
                    Send Email
                  </button>
      
                  <NavLink
                    className="text-indigo-700 text-base mx-auto mt-3 hover:underline hover:text-indigo-800"
                    to="/signin"
                  >
                    Return to sign in page
                  </NavLink>
                </div>
              )}
            </form>
      </div>
    </>
  );
};

export default ResetPassword;
