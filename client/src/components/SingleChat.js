import React from 'react'
import { Box, Text } from '@chakra-ui/react';
import {ChatState} from '../context/chatProvider'
// Icono de volver a atras 
import { ArrowBackIcon } from "@chakra-ui/icons";
// Botonoes de iconos y spinner
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
//Funcion necesaria para selccionar el chat y para mostrar datos del profile del usuario con el chatea
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModel from './miscellaneous/ProfileModel';
import UpdateGroupChatModel from './miscellaneous/UpdateGroupChatModel';

// fetchAgain es una funcion que se pasa por props y que se va a ejecutar para traer los chats del usuario actualizados

const SingleChat = ({fetchAgain, setFetchAgain}) => {

	const { selectedChat, setSelectedChat, user } = ChatState();

	// console.log(selectedChat)

  return (
		<>
			{selectedChat ?  (
				<>
					 <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
						{/* Icono de volver a atras para desseleccionar un chat para volver a los chats en la vista responsive */}
            <IconButton
						// Este icono solo se vera en la vista responsive
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
							// VUelve a atras volviendo selectedChat vacio
              onClick={() => setSelectedChat("")}
            />
						{/* Si el chat seleccionado no es un  chat grupal renderiza lo siguiente */}
						{!selectedChat.isGroupChat ? (
                <>
								{/* Trae el nombre del usuario con el que se chatea */}
									{getSender(user, selectedChat.users)}
									{/* Trae todos los datos del usuario en un modal como un perfil */}
									<ProfileModel
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>) : 
							(
								// Ahora si el chat seleccionado es una chat grupal renderiza lo sig
								<>
								{/* Ponemos el nombre del chat en mayusculas */}
									{selectedChat.chatName.toUpperCase()
									}
									{/* Renderizamos el equivalente al profile del  usuario en un chat con un individuo*/}
									<UpdateGroupChatModel
									// Este es un modal donde podremos cambiar propiedades del chat grupal, el nombre, eliminar, agregar usuarios, dejar el chat, etc.
                    // fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
								</>
							)}
            {/* {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))} */}
          </Text>
					<Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >

					</Box>
				</>) :
			(
				// Si no se selecciona ningun chat  muestra un titulo blanco con el texto Click on a user to start chatting
				<Box display="flex" alignItems="center" justifyContent="center" h="100%">
					<Text fontSize="3xl" pb={3} fontFamily="Work sans">
					Click on a user to start chatting
					</Text>
				</Box>
		)} 
		</>
  )
}

export default SingleChat