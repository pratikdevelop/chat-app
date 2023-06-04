import React, { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import axios from 'axios'
import Message from './message';
import { UseGlobalContext } from '../consumer/UserContext';
import { getUser } from '../apicall/AuthApi';

const ChatBox = (props) => {
    const { currentChat, socketIo, arrivalMessage } = props.chatDat;
    const { user } = UseGlobalContext()
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true);
    const [chatUser, setChatUser] = useState(null);
    const url = process.env.REACT_APP_API_URL;
    const [messages, setMessages] = useState([]);
    console.log('cirre', currentChat);
    useEffect(() => {
        let isGet = false
        if (!isGet) {
            if (arrivalMessage && currentChat && currentChat.members.indexOf(arrivalMessage.senderId) > -1) {
                setMessages([...messages, arrivalMessage])
            }
            setIsLoading(true);
    
            axios.get(url + '/messages/' + currentChat._id, {
                headers: { 'content-Type': "application/json" }
    
            }).then((response) => {
                setIsLoading(false);
                setMessages(response.data.messages)
            })
        }
        return () => {
            isGet = true
        }
    }, [currentChat, arrivalMessage, url])
    
    // eslint-disable-next-line
    useEffect( () => {getChatUser()}, [currentChat])

    const getChatUser = async()=>{
        setIsLoading(true);
        const {user} =await  getUser(currentChat.members[1]);
        setChatUser(user);
        setIsLoading(false);
    }


    const sendChat = () => {
        if (typeof (newMessage) === 'object') {
            const data = new FormData();
            data.append('file', newMessage);
            data.append('senderId', user._id);
            data.append('conversationId', currentChat._id);
            setNewMessage('');

            axios.post(url + '/message/file', data).then((res) => {

                setMessages([...messages, res.data.data])
                setNewMessage('')
                socketIo.current.emit('sendMessage', {
                    message: res.data.data.message,
                    senderId: user._id,
                    recieverId: currentChat.members.find(member => member !== user._id,
                    ),
                    message_type: res.data.data.message_type
                })
            }).catch((error) => {
                console.log(error);
            })
        }

        else {
            axios.post(url + '/message', {
                headers: { 'content-Type': 'application/json' },
                body: {
                    message: newMessage,
                    senderId: user._id,
                    conversationId: currentChat._id
                },
            }).then((res) => {
                socketIo.current.emit('sendMessage', {
                    message: newMessage,
                    senderId: user._id,
                    recieverId: currentChat.members.find(member => member !== user._id,
                    )
                })
                setMessages([...messages, res.data.data])
                setNewMessage('')
            }).catch((error) => {
                console.log(error);
            })
        }

    }
    return (
        <>
        {
            currentChat && currentChat.length <=0 ? <div className=' hidden m-auto font-bold  text-4xl my-auto'>
            </div> :
                <div className="flex flex-col flex-auto border-b-3" style={{ height: "100vh", position: "relative" }}>

            <div className=" relative flex  flex-auto   border-b-3 border-gray-900 flex-col item-center w-full overflow-auto">
                <div className="mb-30 bg-white fixed  z-10 top-0 flex items-center justify-between border-b-3 border-gray-900 w-full px-5 py-2" style={{ borderBottom: "2px solid gray" }}>
                    <div className="flex items-center space-x-2">
                        <AccountCircleIcon fontSize='large' className="text-dark" />
                        {!isLoading && chatUser && Object.keys(chatUser).length > 0 ?
                            <div className="flex flex-col">
                                <div className='text-base font-semibold my-0'> {chatUser.first_name} {chatUser.last_name}</div>
                                <span className=" text-sm text-dark">{chatUser.email}</span>
                            </div> : null
                        }
                    </div>
                   <VisibilityIcon className='ml-auto'/>
                </div>
                <div className='flex flex-col mt-10 -z-6 flex-auto p-4'>
                    {
                        !isLoading && messages && messages.length > 0 ?

                            messages.map((message, index) => {
                                return (
                                    <div className="flex flex-col w-full" key={index}>
                                        <Message data={{ message, user, index }} />
                                    </div>
                                )
                            }) : null
                    }
                </div>
            </div>
            <Stack direction="row" className='bg-white' spacing={2}>
                <TextField className='flex-auto border-0' variant='outlined' color="info" value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)} placeholder='enter message'>
                </TextField>
                <IconButton aria-label="upload picture" component="label">
                    <input hidden type="file" name="chatFile" id="chatFile" accept="audio/*,video/*,image/*" onChange={(e) => setNewMessage(e.target.files[0])} />
                    <AttachFileIcon  fontSize='large' className="text-dark"  />
                </IconButton>

                <Button variant="contained" onClick={sendChat} endIcon={<SendIcon />}>
                    Send
                </Button>
            </Stack>
            </div>
}
        </>
    )
}
export default ChatBox