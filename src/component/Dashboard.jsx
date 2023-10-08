import React, { useEffect, useRef, useState } from 'react';
import { Drawer } from '@mui/material';
import Conversation from './Conversation';
import { io } from 'socket.io-client';
import ChatBox from './ChatBox';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {create_conversation, get_conversation, get_users} from '../services/authservices';
import { UseGlobalContext } from '../consumer/UserContext';
import Users from './pages/Users';
import Heder from './pages/Heder';
import Profile from './pages/Profile';

const Dashboard = () => {
    const socketIo = useRef('');
    const {user} = UseGlobalContext();
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchKey, setSearchKey] = useState('');
    const [leftOpen, setLeftOpen] = useState(false);
    const [profile , setIsProfile] = useState(false);
    const [currentChat, setCurrentChat] = useState([]);
    const [isPermanent, setIsPermanent] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null)
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    console.log(matches);
    useEffect(() => {
        socketIo.current = io('ws://localhost:8900');
        socketIo.current.on('getMessage', data => {
            if (data) {
                setArrivalMessage({
                    senderId: data.senderId,
                    message: data.message,
                    createdAt: Date.now()
                })
            }
        })

    }, []);
    useEffect(() => { let isGet = false;
        if(!isGet) {
            getConversation();
        }
        return () => { isGet = true }
    }, [user, searchKey])
   

    const  getConversation = async ()=>{
        const conver = await get_conversation(user._id, searchKey)
        const allUsers = await get_users(conver);
        setUsers(allUsers);
        setConversations(conver);
        setCurrentChat(conver[0]);
    }

    const createConversation = async(reciever_id) => {
        const conversation = await create_conversation(user._id, reciever_id);
        setConversations([...conversations, conversation])
    };
    const updateConversation = (conversation) => {
        setLeftOpen(false);
        setIsPermanent(matches ? false: true)
        setCurrentChat(conversation)
    };
   
    return (
        <div className="relative flex flex-auto h-full w-full">
            <div className="flex items-center w-full">
                <Drawer variant={matches  ? 'permanent' : 'temporary'}
                    className=' flex-auto h-full  w-80 text-dark border-r-1' open={leftOpen}>
                    <div className="flex flex-col w-full  sm:w-80 space-y-6 py-6 p-6">
                        <Heder data={{setSearchKey,setIsOpen}}/>

                        {
                            conversations.map((conversation, index) => {
                                return <div className="flex items-start cursor-pointer" key={index} onClick={() => updateConversation(conversation)}>
                                    <Conversation data={{ conversation, arrivalMessage, user }} />
                                </div>
                            })
                        }
                    </div>
                </Drawer>
                <ChatBox chatDat={{ currentChat, socketIo, arrivalMessage }}></ChatBox>
                <Users data={{users,createConversation,isOpen}}></Users>             
                <Profile data = {{profile}}/>
            </div>
        </div>
    )
}

export default Dashboard;