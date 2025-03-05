import React from "react";

const Message = (props) => {
    console.log('props',props);
    const {message, user} = props.data;
    const Url = process.env.REACT_APP_API_URL;
  return (
    <>
        {message.senderId !== user._id ? (
          <div className="flex flex-col flex-auto mr-auto ">
            {message.message_type.includes("text") ? (
              <span className=" mt-5 font-semibold text-dark bg-gray-200 p-1 rounded-full px-5">
                {message.message}
              </span>
            ) : message.message_type.includes("video") ? (
              <video
                className="mt-5 h-32 w-32"
                controls
                src={Url+"/"+message.message}
              />
            ) : message.message_type.includes(
                "application/x-zip-compressed"
              ) ? (
              <div className="bg-gray-500 p-3 ">
                <h1>{message.message}</h1>
                <span className="flex items-center space-x-1">
                  <p>{message.message.split(".")[1]}</p>
                  <div>.</div>
                </span>
              </div>
            ) : message.message_type.includes("audio") ? (
              <audio
                className="mt-5 h-32 w-32"
                controls
                src={Url+"/"+message.message}
              />
            ) : (
              <img
                alt={message.message}
                className="mt-5 h-32 w-32"
                src={Url+"/"+message.message}
              />
            )}
            <span className="ml-auto text-sm text-gray-600 p-0.5">
              {new Date(message.updatedAt).toDateString()}
            </span>
          </div>
        ) : (
          <div className="flex flex-col flex-auto ml-auto ">
            {message.message_type.includes("text") ? (
              <span className="mt-5 font-semibold text-dark bg-gray-200 p-1 rounded-full px-5">
                {message.message}
              </span>
            ) : message.message_type.includes("video") ? (
              <video
                className="h-32 w-32 mt-5"
                controls
                src={Url+"/"+message.message}
              />
            ) : message.message_type.includes("audio") ? (
              <audio
                className="h-32 w-32 mt-5"
                controls
                src={Url+"/"+message.message}
              />
            ) : (
              <img
                alt={message.message}
                className="h-32 w-32 mt-5"
                src={Url+"/"+message.message}
              />
            )}
            <span className="ml-auto text-sm text-gray-600 p-0.5">
              {new Date(message.updatedAt).toDateString()}
            </span>
          </div>
        )}
     </>
  );
};

export default Message;
