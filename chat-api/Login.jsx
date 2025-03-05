import React, { useState } from "react";
import { TextField } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useFormik } from 'formik';
import {CommonAlert} from './common/commonAlert'
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "react-toastify/dist/ReactToastify.css";
import { UseGlobalContext } from "../consumer/UserContext";

import { loginSchema } from "../Schemas";
import { login } from "../services/authservices";
const Login = () => {
  const {dispatch} = UseGlobalContext();
  const redirect = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [response, setResponse] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const { values, errors, handleChange, handleBlur, touched, handleSubmit } = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: loginSchema,
    onSubmit: async(values) => {
      setIsLoading(true);
      const  response  = await login(values)
      setResponse(response);
      if (response.variant === 'success') {

        setIsLoading(false);
          dispatch({type: 'LOGIN_SUCCESS',payload:response}).then((res)=>{

              redirect('/')
          })
      }
    }
  })

  return (
    <>
    {
      isLoading ?<><h1>loading ... </h1></>
:<>
 <CommonAlert data = {{open:response.open,message:response.message,variant:response.variant}}/>
      <div className="flex items-center justify-center" style={{height:"100vh", width:"100vw"}}>
        <div className="flex flex-col w-1/3 p-8 bg-transparent border-2 border-gray-100 shadow-xl shadow-gray-500">
          <form className="flex flex-col space-y-5 sm:space-y-10" method="post">
          <div className=" text-center text-xl sm:text-3xl font-bold"> Signin with your account </div>
            <div className="flex flex-col space-y-1">
              <TextField
                variant="filled"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={handleBlur('email')}
                placeholder="email address"
              color = {(errors.email && touched.email) ? 'error': 'success'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                      >
                        {<AccountCircleIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              ></TextField>
              {
                (errors.email && touched.email) ?
                  <p className="text-xl text-red-600 font-bold">{errors.email}</p> : ''
              }
            </div>

            <div className="flex flex-col space-y-1">
              <TextField
              variant="filled"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange("password")}
                onBlur={handleBlur('password')}
              color = {(errors.password && touched.password) ? 'error': 'success'}
                placeholder="password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => showPassword ? setShowPassword(false) : setShowPassword(true)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              ></TextField>
              {
                (errors.password && touched.password) ?
                  <p className="text-xl text-red-600 font-bold">{errors.password}</p> : ''
              }
            </div>
            <div className="flex flex-col w-full space-y-6">
              <div className="flex items-center w-full  justify-center sm:justify-between">
            <span className=" text-xs sm:text-base  font-semibold  text-dark">
               Think to reset password ? 
              <NavLink className=" ml-1 text-blue-900 font-bold " to="/reset-password">
                Foget Password 
              </NavLink>
            </span>
            <span className=" hidden sm:block text-sm sm:text-base  font-bold text-dark">
              Need to create account?
              <NavLink className="ml-1 text-blue-700" to="/signup">
                create account
              </NavLink>
            </span>   
            </div>
          


            <button
              type="button"
              onClick={handleSubmit}
              className="block text-sm sm:text-xl py-3 shadow border-2 text-indigo-700 tracking-4 border-indigo-800 rounded bg-transparent shadow-indigo-600"
 
            >
             Signin your account
            </button>
            <span className="block sm:hidden text-center text-xs sm:text-base  font-bold text-dark">
              Need to create account?
              <NavLink className="ml-1 text-blue-700" to="/signup">
                create account
              </NavLink>
            </span>           
            </div>
          </form>
        </div>
      </div>
</>
    }
     

    </>
  );
};

export default Login;
