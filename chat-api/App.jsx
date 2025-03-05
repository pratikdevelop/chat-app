import React from "react";
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from "./component/Login";
import Signup from "./component/signup";
import Dashboard from "./component/Dashboard";
import ResetPassword from "./component/ResetPassword";
import ChangePassword from "./component/changePassword";
import {UseGlobalContext} from './consumer/UserContext'
const App = () => {
    const state = UseGlobalContext();
    console.log('token', state);
    return (
        <>
            <div>
                <Routes>
                    <Route path="/signup" element={(state && state.token) ?   < Navigate to='/' />:< Signup />} ></Route>
                    <Route path="/signin"element={(state && state.token) ?  < Navigate to='/' />: < Login />} ></Route>
                    <Route path="/"element={(state && state.token) ? < Dashboard />: < Navigate to='/signin' /> }></Route>  
                    <Route path="/reset-password"element={< ResetPassword />} > </Route>
                    <Route path="/verify-otp"element={< ResetPassword />} > </Route>
                    <Route path="/change-password/:id"element={< ChangePassword />}></Route>
                </Routes>
            </div>
        </>
    )
}
export default App;