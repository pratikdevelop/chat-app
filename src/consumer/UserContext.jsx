import { createContext, useContext, useReducer } from "react";
import reducer from "../Reducer/UserReducer";
export const UserContext = createContext();

const initialState = {
  token: localStorage.getItem("token") ? localStorage.getItem("token") : null,
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
};
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
export const UseGlobalContext = () => {
  return useContext(UserContext);
};
