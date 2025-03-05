import { TextField } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import React, { useState } from 'react';

import Menu from "@mui/material/Menu";
import 'react-toastify/dist/ReactToastify.css';
import { UseGlobalContext } from "../../consumer/UserContext";

const Profile = (props) => {
    const [isOpen, setisOpen] = useState(false)
    const [isModelOpen, setisModelOpen] = useState(false);
    const {user} = UseGlobalContext();
    const [password, setpassword] = useState({
        new_password: "",
        confirmPassword: ""
    })
   
    const url = process.env.REACT_APP_API_URL;
    const handleChange = (e) => {
        setpassword({ ...password, [e.target.name]: e.target.value })
    }
    const changePassword = (e) => {
        e.preventDefault();

        axios.post(`${url}/change-password/${user._id}`, password).then((response) => {
            // toast.success('password changed successfully',{
            //     position:toast.POSITION.TOP_RIGHT
            // });

        }).catch((error) => {
            // toast.error(' something went wrong for updating your password ,try again sometime',{
            //     position:toast.POSITION.TOP_RIGHT
            // });
        });

    }
    const uploadProfile = (e)=>{
       const file = e.target.files[0];
       if(file.size< 1000000) {
           const user = new FormData();
            user.append('file', file);
            axios.post(`http://localhost:8000/profile/${user._id}`,  user).then((res)=>{
                    user.profile_image = res.user.profile;
                    // toast.success('profile updated successfully', {
                    //     position: toast.POSITION.TOP_RIGHT
                    // });
            }).catch((err)=>{
                // toast.error(' something went wrong for updating your profile ,try again sometime',{
                //     position:toast.POSITION.TOP_RIGHT
                // });
            })
       }
    }
    return (
        <>
          <Menu
                        anchorEl={props.data.profile}
                        open={props.data.profile}
                        onClose={() => {props.data.profile = false;}}               >     
        <div className='flex flex-col flex-auto min-w-0  h-full overflow-y-auto'>
            <div className="flex flex-col shadow bg-card">
                <div >
                    <img src="/images.jpg" alt='background' style={{
                    width: "100%",
                    verticalalign: "top"
                    }} className="h-60 object-cover" />
                </div>
                <div className="flex flex-col flex-0 lg:flex-row items-center max-w-5xl w-full mx-auto px-4">
                    <Avatar  className="relative " src={user.profile_image
                    ? 'http://localhost:8001/'+user.profile_image: ''}>
                    <IconButton className="absolute" color="primary" aria-label="upload picture" component="label">
                        <input hidden accept="image/*" name="file"  onChange={uploadProfile}  type="file" />
                        <PhotoCamera />
                    </IconButton>
               
                    </Avatar>
                    <div className="flex flex-col sm:flex-row sm:items-center w-full ">
                        <div className="flex items-center lg:m-0 lg:ml-auto space-x-6" >
                            < button className="font-medium text-secondary cursor-pointer" onClick={() => (isOpen) ? setisOpen(false) : setisOpen(true)}> Edit Profile </button>
                            < button className=" font-medium  text-secondary cursor-pointer" onClick={() => (isModelOpen) ? setisModelOpen(false) : setisModelOpen(true)}> Change Password </button>
                        </div>
                              
                    </div>
                </div>
            </div>


            <div className="flex flex-col w-full justify-center items-center  mt-5">
                <Modal open={isModelOpen}>
                <div className="flex justify-center items-center w-full h-full">
                        <Box style={{ background: "white", width: "500px", padding: '40px' }} component="form" noValidate autoComplete="off" method="post">

                            <div className="flex flex-col space-y-8 ">
                            <div className="font-bold text-4xl  text-primary capitalize text-center">Change Password</div>
                                <TextField label="Enter New Password" type="text" name="new_password" onChange={handleChange} value={password.new_password} placeholder="Enter New  Password"></TextField>
                                <TextField label="Enter confirm Password" type="text" name="confirmPassword" onChange={handleChange} value={password.confirmPassword} placeholder=" Enter confirm Password"></TextField>
                                <div className="flex items-center justify-between  mt-4">
                                    <Button variant="contained" size="medium" color="error" onClick={()=>setisModelOpen(false)} > cancel</Button>
                                    <Button variant="contained" size="medium" color="primary" onClick={changePassword}> submit</Button>
                                </div>
                            </div>
                        </Box>
                    </div>
                </Modal>

               
            </div>

        </div>
        </Menu>
        </>
    )
}

export default Profile

