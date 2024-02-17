import React, {useState, useEffect} from 'react'
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../context/chatProvider";
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
//Funcion necesaria para poder seleccionar el chat
import {getSender} from '../config/ChatLogics'
import GroupChatModel from './miscellaneous/GroupChatModel';
import ENDPOINT from '../helper/endpoint';


// fetchAgain es una funcion que se pasa por props y que se va a ejecutar para traer los chats del usuario actualizados
const Mychats = ({fetchAgain}) => {

  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
      //  http://localhost:5000/
  // https://chat-app-production-3083.up.railway.app/


  const toast = useToast();

  //funcion que trae todos los chat en el que el usuario logeado esta presente 
  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
//esta funcion me trae todos los chats en el que el usuario logeado esta presente a traves de una llamada al backend
      const { data } = await axios.get(`${ENDPOINT}api/chat`, config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    //Apenas al iniciar el componente pasamos los datos del usuario logeado a este stado local y ejecutamos fetchChats trayendonos todos los chats en los que el usuario logeado tenga
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);


  return (
    <Box
    //hace que al seleecionar un chat y de acuerdo al tamano de la pantalla se muestre solo el menu de chats o el chat en concreto
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My chats
        <GroupChatModel>
          <Button
              display="flex"
              fontSize={{ base: "17px", md: "10px", lg: "17px" }}
              rightIcon={<AddIcon />}
            >
              New Group Chat
          </Button>
        </GroupChatModel>
      </Box>
			<Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
              // Funcion que hace que el chat que seleccionemos sea el elegido para mostrar en la ventana de chats
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
									{/* Preguntamos si es un chat de grupo, si es uno de grupo lo*/}
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {/* Muestra los chats con sus ultimos mensajes */}
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  )
}

export default Mychats