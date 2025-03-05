import React from "react";
import { Drawer } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Typography from "@mui/material/Typography";
import { UseGlobalContext } from "../../consumer/UserContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
const Users = (props) => {
  const { users, createConversation, isOpen } = props.data;
  const { user } = UseGlobalContext();
  return (
    <>
      
      <Drawer
        anchor="left"
        variant="temporary"
        className=" h-full border-l-2  overflow-auto border-white"
        open={isOpen}
        onBackdropClick={() => (isOpen = false)}
      > {
        users && users.length >0 ?
        <>
        
        <div className="flex items-center p-4">
          <Typography variant="h4" component="h2">
            New chat
          </Typography>
          <HighlightOffIcon
            className="ml-auto cursor-pointer"
            onClick={() => {
              isOpen = false;
            }}
          />
        </div>
        <ul className="flex flex-col w-80 space-y-4 p-3">
          {users.map((newuser, index) => {
            if (user._id !== newuser._id) {
              return (
                <div
                  onClick={() => createConversation(newuser._id)}
                  className="flex items-center p-2 space-x-2 cursor-pointer"
                  key={newuser._id}
                >
                  <AccountCircleIcon className=""></AccountCircleIcon>
                  <li className="flex flex-col  mr-10">
                    <span className="font-semibold text-base">
                      {newuser.first_name} {newuser.last_name}
                    </span>
                    <span className="text-secondary text-sm truncate">
                      {newuser.email}
                    </span>
                  </li>
                </div>
              );
            } else {
              return null;
            }
          })}
        </ul>
        </>
        :
        null
      }
      </Drawer>
    </>
  );
};

export default Users;
