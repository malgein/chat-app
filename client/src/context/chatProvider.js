import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({children}) => {

	const [user, setUser] = useState();

	const [selectedChat, setSelectedChat] = useState()

	const [chats, setChats] = useState([])

	// Estado global para las notificaciones de la app
	const [notification, setNotification] = useState([]);


	const navigate = useNavigate()

	useEffect(() => {
		//Se le pasa a la variable el usuario del local storage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
		//Luego se le pasa al estado user  el userInfo
    setUser(userInfo);

		// si no hay un usuario logeadp  devuelveme a la home
    if (!userInfo) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

	return(
		<ChatContext.Provider
		value={{
				user,
				setUser,
				selectedChat,
				setSelectedChat,
				chats,
				setChats,
				notification,
				setNotification
			}}
			>{children}
		</ChatContext.Provider>
	) 
}

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider