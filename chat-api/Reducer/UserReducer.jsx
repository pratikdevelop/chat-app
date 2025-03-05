import React from 'react'
const UserReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            state.token=action.payload.token;
            state.user= action.payload.user      
            break;
        case 'LOGOUT':
            state.token=null;
            state.user= null;
            break;    
        default:
            break;
    }
    return state;
}

export default UserReducer