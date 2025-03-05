import { TextField } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { useFormik } from 'formik';
import axios from 'axios';
import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { changePasswordSchema } from "../Schemas";
const ChangePassword = () => {
    const { id } = useParams();
    const url = process.env.REACT_APP_API_URL;
    const nav = useNavigate()
    const { values, errors, handleChange, handleBlur, touched, handleSubmit } = useFormik({
        initialValues: {
            password: "",
            confirmPassword: ""
        },
        validationSchema: changePasswordSchema,
        onSubmit: (values) => {

            axios.post(`${url}/change-password/${id}`, values).then((response) => {
                toast.success('password changed successfully', {
                    position: toast.POSITION.TOP_RIGHT
                });
                nav('/signin');

            }).catch((error) => {
                toast.error(' something went wrong for updating your password ,try again sometime', {
                    position: toast.POSITION.TOP_RIGHT
                });
            });
        }
    })

    const [checked, setChecked] = useState(false);

    const handlechecked = (event) => {
        setChecked(event.target.checked);
    };
    return (
        <div>
            <ToastContainer />
            <div className="reset-password  bg-gray-900">
                <form className="bg-gray-200  form shadow shadow-gray-600" onSubmit={handleSubmit} method="post">

                    <div className="flex flex-col space-y-8 ">
                        <div className="heading">Reset your Password</div>
                        <div className=" flex flex-col w-full space-y-1">

                            <TextField  type={checked ? 'text' : 'password'} name="password" onChange={handleChange} onBlur={handleBlur} value={values.password} placeholder="Enter New Password"></TextField>
                            {
                                (errors.password && touched.password) ?
                                    <p className="text-red-600 p-2 mt-2  font-semibold">{errors.password}</p> : ''
                            }

                        </div>
                        <div className=" flex flex-col w-full space-y-1">
                            <TextField  type={checked ? 'text' : 'password'} name="confirmPassword" onChange={handleChange} onBlur={handleBlur} value={values.confirmPassword} placeholder=" Enter confirm Password"></TextField>
                            {
                                (errors.confirmPassword && touched.confirmPassword) ?
                                    <p className="text-red-600 p-2 mt-2 font-semibold">{errors.confirmPassword}</p> : ''
                            }
                        </div>
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center ml-auto">
                                <Checkbox
                                    checked={checked}
                                    onChange={handlechecked}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                /> show password
                            </div>
                                <Button variant="contained" type="submit" size="medium" color="primary"> submit</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChangePassword