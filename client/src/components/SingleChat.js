import React, {useState, useEffect, useRef} from 'react'
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
import ScrollableChat from './ScrollableChat';
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import axios from 'axios'
import io from "socket.io-client";
import Lottie from 'react-lottie'
import animationData from '../animations/typing.json'
import "./styles.css";
import ENDPOINT from '../helper/endpoint';


// fetchAgain es una funcion que se pasa por props y que se va a ejecutar para traer los chats del usuario actualizados

const SingleChat = ({fetchAgain, setFetchAgain}) => {
// State que contiene todos los mensajes del chat en un array todos los mensajes del chat seleccionado
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // State que contiene lo que escribe el usuario el mensaje como tal
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  //  http://localhost:5000/
  // https://chat-app-production-3083.up.railway.app/
  

  // Necesario para hacer conexiones con socket io
  // var socket, selectedChatCompare;
  const socket = useRef();
  const selectedChatCompare = useRef();


  // socket = io(ENDPOINT);
  // selectedChatCompare = selectedChat;
  // Funcion que se trae todos los mensajes de un chat en particular mediante su id
  const fetchMessages = async () => {
    // Si no hay un chat seleccionado se interrumpe la funcion
    if (!selectedChat) return;
      // Nos preparamoos para el pedido get del backend donde traeremos todos los mensajes
    try {
      const config = {
        // Realizamos las configuraciones del token recordar que es una ruta protegida
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // van a suceder cosas en el backend asi que ponemos a cargar la aplicacion
      setLoading(true);
      // Traeremos todos los mensajes del chat seleccionado
      // console.log(selectedChat._id)
      const { data } = await axios.get(
        `${ENDPOINT}api/message/${selectedChat._id}`,
        config
      );
      // console.log(messages)
      // Guardamos todos los mensajes en el state correspondiente messages
      setMessages(data);
      // han dejado de pasar cosas en el backend loading off
      setLoading(false);
      // Hacemos cosas a traves de los sockets
      socket.current.emit("join chat", selectedChat._id);
    } catch (error) {
      // Lidiamos con el error no pudimmos trare todos los mensajes del chat seleccionado desde la BD
      console.log(error.message)
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // Funcion muy importante que envia el mensaje que se escribe
  const sendMessage = async(event) => {
    // preguntamos si la tecla que presiono el cliente es Enter y si existe un nuevo mensaje a traves del state newMessage
    if (event.key === "Enter" && newMessage){
      // Necesario para  el feature de typing, cuando enviamos el mensaje detiene el aviso de istyping
      socket.current.emit("stop typing", selectedChat._id);
      // Nos preparamoos para el pedido post del backend donde crearemos un nuevo mensaje
      try {
        // Realizamos las configuraciones del token recordar que es una ruta protegida
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        // Recordadno que la ruta para crear un nuevo mensaje y guardarlo en la BD recibe un content y un id de chat
            // limpiamos el state del mensaje para que se borre lo que escribimos del inpur de mensajes, esto no afecta a la llamada del backend porque es una peticion asincrona
            setNewMessage("");
        const { data } = await axios.post(
          `${ENDPOINT}api/message`,
          {
            // el contenido del nuevo mensaje es del state que esxtrae lo que escribimos del input
            content: newMessage,
            // el id del selectedChat osea el chat seleccionado
            chatId: selectedChat._id,
          },
          config
        );
          // console.log(data)
        // Se hace un envio de datos mendiante sockets
        socket.current.emit("new message", data);
        // guardamos en el state de los mensajes el resultado de la llamada al backend que en este caso sera el mensaje como tal lo guardamos en el state messages junto los demas mensajes escritos anteriormente
        setMessages([...messages, data]);
      } catch (error) {
        // Lidiamos con el error y enviamos un alert
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }

   // Apenas se monta el componente hace inicio de la conexion a traves de sockets
   
   
   useEffect(() => {
     // Hace posible la conexion de web socket con la parte del servidor
     socket.current = io(ENDPOINT);
     socket.current.emit("setup", user);
     socket.current.on("connected", () => setSocketConnected(true));
     socket.current.on("typing", () => setIsTyping(true));
     socket.current.on("stop typing", () => setIsTyping(false));
 
     // eslint-disable-next-line
   }, []);
 

 // Apenas se monta el componente se traen todos los mensajes  del chat
 useEffect(() => {
   fetchMessages();
   
   selectedChatCompare.current = selectedChat;
   // eslint-disable-next-line
   // Apenas se cambia el chat seleccionado se traen todos los chats del nuevo chat seleccionado
 }, [selectedChat]);

 console.log(notification)


 useEffect(() => {
   socket.current.on("message recieved", (newMessageRecieved) => {
     if (
       !selectedChatCompare.current || // if chat is not selected or doesn't match current chat
       selectedChatCompare.current._id !== newMessageRecieved.chat._id
     ) {
      // Logica de notificaciones
      // Si las notificaciones que ya existen no incluyen la notificacion que se esta agregando recientemente
       if (!notification.includes(newMessageRecieved)) {
        // Agregamos el mensaje recibido a las notificaciones
        // console.log(newMessageRecieved)
         setNotification([newMessageRecieved, ...notification]);
        //  setNotification(prevNotification => new Set([...prevNotification, newMessageRecieved]));
        //  setNotification([notification, ...new Set(notification)])
         setFetchAgain(!fetchAgain);
       }
     } else {
       setMessages([...messages, newMessageRecieved]);
     }
   });
 });
  
  // Evento onchange donde se controla lo que se escribe en chat
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Funcionalidad de typing mediante los states de typing
    if (!typing) {
      setTyping(true);
      // Envia una señal al backend cada vez que se escribe algo mediante sockets
      socket.current.emit("typing", selectedChat._id);
    }
    // mas logica de typing
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.current.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength)
  }

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
                    fetchMessages={fetchMessages}
                  />
                </>
              )}
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
            {/* Si los mensajes estan cargando se muestra un spinner */}
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            {/* Formulario donde se escribe el mensaje del chat como tal */}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {/* Si el usuario esta escribiendo renderiza una animacion apropiada */}
              {istyping ? (
                <div>
                  {/* animacion de typing */}
                   
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                  {/* Loading... */}
                </div>
              ) : (
                <></>
              )}
              {/* input como tal donde se escribe el mensaje */}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
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
