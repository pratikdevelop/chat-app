import axios from "axios";
const url = process.env.REACT_APP_API_URL;

const login = async (data) => {
  try {
    const response = await axios.post(url + "/signin", data);
    const { userId, token } = response.data.data;
    localStorage.setItem("token", token);
    const response_data = {
      message: "login successfull",
      open: true,
      variant: "success",
      token,
    };
    const userData = await getUser(userId);
    if (userData.user) {
      localStorage.setItem("user", JSON.stringify(userData.user));
      response_data.user = userData.user;
    }
    return response_data;
  } catch (error) {
    return {
      message: `login unsuccessful`,
      open: true,
      variant: "error",
    };
  }
};
const getUser = async (userId) => {
  try {
    const response = await axios.get(`${url}/user/${userId}`);
    const user = response.data;
    return { user, variant: "success" };
  } catch (error) {
    return {
      message: `user response not fetched , ${error.response}`,
      open: true,
      variant: "error",
    };
  }
};
const create_conversation = async (sender_id, reciever_id) => {
  try {
    const response = await axios.post(url + "/conversation", {
      body: { sender_id, reciever_id },
    });
    return response.data.conversation;
  } catch (error) {
    return {
      message: `some error found in create conversation, ${error.response}`,
      open: true,
      variant: "error",
    };
  }
};

const get_conversation = async (userId, search) => {
  try {
    const response = await axios.get(url + "/converstions/" + userId, {
      params: { search },
    });
    return response.data.conversation;
  } catch (error) {
    return [];
  }
};

const get_users = (conversations) => {
  try {
    const response = axios.get(url + "/users");
    const filterusers = response.data.users.filter((user) => {
      return conversations.some((conversation) => {
        return !conversation.members.includes(user._id);
      });
    });
    return filterusers;
  } catch (error) {
    return null;
  }
};

export { getUser, login, create_conversation, get_conversation, get_users };
