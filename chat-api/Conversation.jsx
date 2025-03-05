import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React,{ useEffect, useState } from 'react';
import axios from 'axios';

const Conversation = (props) => {
    const [chatUser, setChatUser] = useState({})
    const url = process.env.REACT_APP_API_URL
    const { conversation, arrivalMessage,user} = props.data;
    const [message, setMessage] = useState();
    useEffect(() => {
        let isGet = false;
        const id = conversation.members.filter((member) => {
            return (member !==user._id)
        })
        axios.get(url+'/user/' + id, {
            headers: { 'content-Type': "application/json" }

        }).then((response) => {
            if (!isGet) {
                setChatUser(response.data)
            }
        })
        return () => {
            isGet = true
        }
    }, [conversation.members,user._id])

    useEffect(() => {
            axios.get(url+'/messages/' + conversation._id, {
                headers: { 'content-Type': "application/json" }

            }).then((response) => {
                if (response.data.messages) {
                    setMessage(response.data.messages[response.data.messages.length-1])
                }

            })
    }, [conversation, arrivalMessage])

    const getDateFormat =(date)=>{
        const newDate =  new Date(date);
        return `${newDate.getDate()}/${newDate.getMonth()}/${newDate.getFullYear()} `
    }
    return (
        <>
            <AccountCircleIcon fontSize='large'/>
            <li className='flex flex-col ml-2' >
                <span className='user_name'>{chatUser.first_name} {chatUser.last_name}</span>
                <span  className='user_msg'>{message ? (message['message_type'] === 'text')? message['message'] : message['message_type']:'no message' }</span>
            </li>
            <span className='ml-auto mt-1.5'>{message ? getDateFormat(message.createdAt):  null }</span>
        </>
    )
}

export default Conversation