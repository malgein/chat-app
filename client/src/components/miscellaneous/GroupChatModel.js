import React, { useState} from 'react'
//Componente de chackra ui para crear modales
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";
import { ChatState } from "../../context/chatProvider";
import axios from 'axios'
import UserListItem from '../userAvatar/UserListItem' 
import UserBadgeItem from '../userAvatar/UserBadgeItem';

//Componente creado para crear el modal de chat de grupo
const GroupChatModel = ({children}) => {

	//Componente de chakra ui para crear modales
	const { isOpen, onOpen, onClose } = useDisclosure();

  // Estado que llevara el nombre del chat grupal lo tendra como valor uno de nuestros inputs
	const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

	const { user, chats, setChats } = ChatState();

  const handleSearch = async(query) => {
    //query es name o el email del usuario que deseamos encontrar
    setSearch(query);
    //Si no existe error
    if (!query) {
      return;
    }

    try {
      // si existe pasamos el loading a true
      setLoading(true);
      // nos encargamos de gestionar el token de acceso
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      //hacemos la peticion a la api con el query y lo guardamos en searchResult
      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
      console.log(data);
      // Pasamos el loading a false
      setLoading(false);
      // Obtenemos la respuesta de la llamada al backend y los guardamos en el state searchResult
      setSearchResult(data);
    } catch (error) {
      // Mensaje de error en caso de error a la llamda del servidor
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

  //Funcion sumamente importante que creara el chat grupal como tal
  const handleSubmit = async () => {
    //Primero comprobamos que existe un nombre para el chat o que hayan usuarios seleccionados
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    //HAremos un llamado a nuestro servidor esta vez para crear un grupo de chat grupal por supuesto requiere autorizacion a traves de un token
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Hacemos un llamado a la ruta del backend para crear un chat grupal
      const { data } = await axios.post(
        `http://localhost:5000/api/chat/group`,
        {
          // le pasamos como valores para crear el chat el nombre a traves de groupChatName
          name: groupChatName,
          // Le pasamos a traves de un formato Json gracias a JSON.stringify los ids de los usuarios seleccionados para conformar el array de usuarios que tiene el cgat grupal
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      // Al final el resultado de la llamda al backend me devolvera el chat grupal, ese chat se lo pasaremos a chats del context junto con los demas chats que ya existen siendo el mas reciento situado primero que estos
      setChats([data, ...chats]);
      onClose();
      //Si todo sale bien enviamos mensaje de exito
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        // si algo sale mal mensaje de error
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
//Funcion  agrega los usuarios buscados al state de selectedUsers para luego ser enviados al servidor y agregados al chat grupal
  const handleGroup = (userToAdd) => {
    // Si sl state selectedUsers contiene userToAdd (los usuarios que estamos buscando) enviamos el mensaje de error correspondiente
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    //Si no agregamos los usuarios que estamos buscando al state de selecetedUsers
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  //Funcion que se activa al eliminar usuarios seleccionados
  const handleDelete = (delUser) => {
    //Simplemente hace un filter de los usuarios seleccionados a partir del usuario que se le pasa por parametro
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

	return (
		<>
			<span onClick={onOpen}>{children}</span>
			{/* Modal para crear un chat de grupo */}
			<Modal onClose={onClose} isOpen={isOpen} isCentered>
			  <ModalOverlay />
			  <ModalContent>
			    <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
					<ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
          <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: John, Piyush, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap">
              {/* Mapeamos los usuarios seleccionados por el controlador handleGroup
              // Los muestra en un componente de avatar previamente creado */}
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  // Funcion que va a eliminar los usuarios seleccionados de su seleccion como tal
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              // mapeamos los usuarios buscados pero solo mostramos las 4 primeras coincidencias de usuarios para ser mostradas
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
					<ModalFooter>
            {/* Creamos nuestro chat con este button llamado al handleSubmit */}
            <Button onClick={handleSubmit}  colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
		</>
	)
}

export default GroupChatModel