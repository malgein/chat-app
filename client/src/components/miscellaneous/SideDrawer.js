// @js-ignore
import React, {useState} from 'react'
import { Button } from "@chakra-ui/button";
import { Box, Text } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import {useNavigate} from 'react-router-dom'
import { getSender } from "../../config/ChatLogics";
import { useToast } from '@chakra-ui/toast';
import { 
	Avatar,
	useDisclosure, 
	Menu, 
	MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
//Input de buscar usuarios del sidebar
import { Input } from "@chakra-ui/input";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from '../../context/chatProvider';
//Modales de chakra ui
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import ProfileModel from './ProfileModel';
import axios from 'axios'
//Spinner de nuestra app
import ChatLoading from '../ChatLoading';
//componente de renderizado con el mapeado de los usuarios a buscar 
// import UserListItem from '../userAvatar/UserListItem.js'
import UserListItem from '../UserListItem';
import { Spinner } from '@chakra-ui/react';
import './SideDrawer.css'
import ENDPOINT from '../../helper/endpoint';

//Este componente representa el navbar y el sidebar tipo modal de la app
const SideDrawer = () => {

	  // Version deployada del backend

		//  http://localhost:5000/
  // https://chat-app-production-3083.up.railway.app/

	//Estado que contiene el nombre o el email del usuario a buscar
  const [search, setSearch] = useState("");
	//Guardamos el resultado de la llamada al backend de buscar a los usuarios por name o por email
  const [searchResult, setSearchResult] = useState([]);
	//Representa el loading de la app cuando esta en true esta cargando por lo que tras bambalinas esta pasando algo (una busqueda de algo a traves de una llamada al backend por ej) y cuando se ejecuta esa busqueda la pasamos a false que ya deja de cargar
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	//Componente de chakra ui que se encarga de crear notificaciones  estilo sweet alert
	const toast = useToast()
	const navigate = useNavigate()

	//Usuario logeado proviene del context
	const {user, setSelectedChat, chats, setChats, notification, setNotification} = ChatState()

	// const [isActive, setIsActive] = useState(false);
 	// const [notificationCount, setNotificationCount] = useState(0);

	//Funcion que deslogea al usuario
	const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

	//Funcion para realizar una búsqueda en los usuarios para el chat mediante el nombre o mediante el email independienteente de mayusculas o minusculas gracias a la llamada de endpoint del backend
	const handleSearch = async() => {
		if(!search){
			toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
		}
		try {
      setLoading(true);

			//Le pasamos el token de autorizacion del usuario logeado para que nos deje hacer la llaamada al endpoint de busqueda
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

			//debemos aplicar la configuracion de headers debido a que para llamar al endpoint necesitamos un token de autoriacion 
      const { data } = await axios.get(`${ENDPOINT}api/user?search=${search}`, config);

      setLoading(false);
			//Guardamos el resultado  que nos devuelve el endpoint del backend en searchResult state
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }

	}

	//FUncion que trae el chat del usuario seleccionado y el usuario logeado, si no existe ese chat lo crea de cero
	const accessChat = async(userId) => {
		// console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`${ENDPOINT}api/chat`, { userId }, config);

			//chats son todos los chats de la bd aqui verificara que el chat traido entre los dos usuarios anteriormente ya se encuentre entre los chats de la bd si no se encuentra lo actualiza
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
			//Implica la data del chat 
      setSelectedChat(data);
      setLoadingChat(false);
			//Cerramos el modal
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }

	}

	// console.log(notification)

  return (
    <>
			<Box
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				bg="white"
				w="100%"
				p="5px 10px 5px 10px"
				borderWidth="5px"
			>
				{/* Icono de busqueda contiene el siguiente mensaje que aparece al hacer hover sobre el*/}
				<Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
					<Button variant="ghost" onClick={onOpen}>
						<i className="fas fa-search"></i>
          	<Text display={{ base: "none", md: "flex" }} px={4}>
         	 		Search User
          	</Text>
					</Button>
				</Tooltip>
				<Text fontSize="2xl" fontFamily="Work sans">
          Chat App
        </Text>
				<div>
					<Menu>
						<MenuButton p={1} >
							{/* Paquetevisual para notificaciones de react js */}
						{/* <NotificationBadge
                count={notification.length}
								//  Este es el efecto visual de notificaciones
                effect={Effect.SCALE}
              /> */}

							{/* <BellIcon m={1} fontSize="2xl"/> */}
							<div className="notification-container">
      					<div className='notification-icon'>
        				{notification.length > 0 && <span className="notification-count">{notification.length}</span>}
								<BellIcon m={1} fontSize="2xl"/>
      					</div>
    					</div>

						</MenuButton>
						<MenuList pl={2}>
							{/* Si no existen notificaciones "no hay notificaciones en la campanita" */}
							{!notification.length && "No New Messages"}
							{/* Mapeamos las notificaciones y las mostramos dentro de un modal */}
							{notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
										// La sig linea permirte q nos dirijamos inmediatamente al chat al seleccionar la notificacion convirtiendo el chat de la notificacion en el chat seleccionado
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat?.isGroupChat
                    ? `New Message in ${notif.chat?.chatName}`
                    : `New Message from ${getSender(user, notif.chat?.users)}`}
                </MenuItem>
              ))}
						</MenuList>
					</Menu>
					<Menu>
						<MenuButton as={Button} rightIcon={<ChevronDownIcon/>} >
							{/* Avatar del usuario */}
							<Avatar
								size='sm'
								cursor='pointer'
								name={user.name}
								src={user.pic}
							/>
						</MenuButton>
						<MenuList>
							{/* Boton de perfil */}
							<ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
            	</ProfileModel>
							<MenuDivider />
							{/* Boton de deslogeo */}
							<MenuItem onClick={logoutHandler}>Log out</MenuItem>				
						</MenuList>
					</Menu>
				</div>
			</Box>
			{/* El componente Drawer de chakra ui y todo lo que contiene representa el modal sidebar que contiene la busqueda de usuarios para chatear */}
			<Drawer placement='left' onClose={onClose} 	isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
					<DrawerBody>
            <Box display="flex" pb={2}>
							{/* Input donde el usuario busca por email o nombre */}
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
							{/* Boton para realizar la busqueda */}
              <Button onClick={handleSearch}>Go</Button>
            </Box>
						{/* Si no esta cargando la app renderiza el mapeo de usuarios buscados por nombre / email */}
						{loading ? (<ChatLoading /> ): (
							searchResult?.map(user => (
								<UserListItem 
									key={user?._id}
									handleFunction={() => accessChat(user?._id)}
									user={user}
								/>
							))
							// <></>
						) }
						{loadingChat && <Spinner ml="auto" display="flex" />}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
  )
}

export default SideDrawer