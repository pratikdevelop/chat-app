import React from "react";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import InputBase from "@mui/material/InputBase";
import { useNavigate } from "react-router-dom";
import { UseGlobalContext } from "../../consumer/UserContext";

const Heder = (props) => {
    const redirect = useNavigate()
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const {user} = UseGlobalContext()
    const logoutfun = () => {
        localStorage.clear();
        setTimeout(() => {
            redirect('/')
        }, 4000);
    }
    return (
        <>
            <div className="flex flex-auto p-2 items-center justify-between w-full">
                <div className="flex items-center space-x-1">
                <AccountCircleIcon fontSize="large" className="text-dark" />
                <div className="flex flex-col">
                <span className='text-xl font-bold'>{user.first_name} {user.last_name}</span>
                <span className="text-sm text-slate-900" >{user.email}</span></div>
                </div>

                <div className="flex items-center ml-auto space-x-2">
                    <button
                        className="text-dark"
                        aria-controls={open ? "demo-positioned-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={(event) => {
                            setAnchorEl(event.currentTarget);
                        }}
                    >
                        <MoreVertOutlinedIcon />
                    </button>
                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => {
                            setAnchorEl(false);
                        }}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                    >
                        <MenuItem onClick={() =>{ props.data.setIsOpen(true)
                        setAnchorEl(false)}}> New chat</MenuItem>
                        <MenuItem
                            onClick={() => {
                               props.data.setIsOpen(true)
                            }}
                        >
                            profile
                        </MenuItem>
                        <MenuItem onClick={logoutfun}>Logout</MenuItem>
                    </Menu>
                </div>
            </div>
            <div className="flex items-center jusstify-start">
                <Paper
                    component="form"
                    className="border-1 shadow"
                    sx={{
                        p: "4px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1, color: "GrayText" }}
                        placeholder="Search user"
                        inputProps={{ "aria-label": "Search user" }}
                        onKeyUp={(event) => props.data.setSearchKey(event.target.value)}
                    />
                </Paper>
            </div>
        </>
    );
};

export default Heder;
