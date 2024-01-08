import React, {useState} from 'react'
// Para crear Modales del chakra ui 
import {Modal,
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
IconButton,
Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
//Estados globales del context
import {ChatState} from '../../context/chatProvider'
import UserBadgeItem from '../userAvatar/UserBadgeItem.js';
// import UserListItem from '../userAvatar/UserListItem.js';
import axios from 'axios'

// los props de llamar otra vez los usuarios del chat
const UpdateGroupChatModel = ({ fetchMessages, fetchAgain, setFetchAgain }) => {

  // Version deployada del backend
  const ENDPOINT = 'https://chat-app-production-3083.up.railway.app/'


  //  http://localhost:5000/
  // https://chat-app-production-3083.up.railway.app/

	//Funcionalidades requeridas para los modales
  const { isOpen, onOpen, onClose } = useDisclosure();
// Es un loading que saldra cuando cargue el backend para cambiar el nombre del chat grupal
	const [renameloading, setRenameLoading] = useState(false);

	// Estado para contener nombre del chat que sera modificado mediante un event onChange en el input de Chat Name
	const [groupChatName, setGroupChatName] = useState();

	const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

	const [searchResult, setSearchResult] = useState([]);

	//Estados globales de la app
	const { selectedChat, setSelectedChat, user } = ChatState();
	// Para los mensajes estilo alert
	const toast = useToast();


	const handleRemove = async(user1) => {
    // Nos aseguramos de que el usuario logeado sea el admin del grupo, de no ser asi mensaje de error ya que solo admins pueden remover a otros usuarios al mismo tiempo que no podemos seleccionarnos a nosotros mismos para ser eliminados por esta via
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
       // pOnemos a cargar mientras sucenden cosas en el backend y en la BD
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Hacemos una llamada al endpoint que elimina  usuarios del chat grupal, este recibe el id del chat  y el id del usuario que eliminamos 
      const { data } = await axios.put(
        `${ENDPOINT}api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
        // Si el usuario que intentamos eliinar somos nosotros mismos entonces el chat seleccionado se borra
      user1._id === user._id ? setSelectedChat() : 
      // el chat seleccionado sera el resultado del enpoint que es el chat con los nuevos usuarios despues que eliminamos al usuario que queriamos
      setSelectedChat(data);
       // Ejecutamos fethAgain para actualizar todo
      setFetchAgain(!fetchAgain);
      // actualizamos los mensajes cada vez que borremos a un usuario
      fetchMessages();
         // Apagamos el loading indicando que las cosas en el backend terminaron
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
	}

	const handleRename = async () => {
		// Si no hay nombre de chat introducido en el inout se acaba la funcion

		if (!groupChatName) return;

    try {
			// ponemos el loading en true mientras ocurren cosas en elbackend
      setRenameLoading(true);
			//  pasamos cosas en le header de la llamada al backend
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
			// Endpoint para cambiar el nombre al chat en la bd necesitamos el id del chat y el nuevo nombre del chat
      const { data } = await axios.put(
        `${ENDPOINT}api/chat/rename`,
        {
					// le pasamos el id del chat seleccionado que vamos a editar
          chatId: selectedChat._id,
					// Y el nombre el chat lo cambiamos al state groupChatName
          chatName: groupChatName,
        },
        config
      );

      // console.log(data._id);
      // setSelectedChat("");
			// el chat a selecionar sera el resuktado de la llamada el endpoint que es el chat al que acabamos de cambiar el nombre con los datos actualizados
      setSelectedChat(data);
			// Actualizamos ahora los datos de los chats mediante la funcion fetchAgain
      setFetchAgain(!fetchAgain);
			// Una ve que termina todo ponemos el loading en apagar
      setRenameLoading(false);
			// Manejamos cuaalquier error posible
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
		// Y el nombre del grupo lo restablecemos a ""
    setGroupChatName("");

  };

  //Funcion para realizar una búsqueda en los usuarios para el chat mediante el nombre o mediante el email independienteente de mayusculas o minusculas gracias a la llamada de endpoint del backend
	const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
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
      // console.log(data);
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
      setLoading(false);
    }

  };

	const handleAddUser = async (user1) => {
    // Nos aseguramos si el usuario  que hemos seleccionado ya se encuentra en el grupo , de ser si mensaje de errror
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
// Nos aseguramos de que el usuario logeado sea el admin del grupo, de no ser asi mensaje de error
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      // pOnemos a cargar mientras sucenden cosas en el backend y en la BD
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Hacemos una llamada al endpoint que agrega nuevos usuarios al chat grupal, este recibe el id del chat a agregar y el id del usuario que agregaremos 
      const { data } = await axios.put(
        `${ENDPOINT}api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
        // La llamada al endpoint devuelve el chat modificado ahora con los nuevos usuarios
      setSelectedChat(data);
      // Ejecutamos fethAgain para actualizar todo
      setFetchAgain(!fetchAgain);
      // Apagamos el loading indicando que las cosas en el backend terminaron
      setLoading(false);
      // Si ocurre algun error enviamos un alert con la descripcion del error
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    // Restablecemos el valor del chat a ""
    setGroupChatName("");
  };

  return (
    <>
		{/* El icono del profile del grupo siendo un ojo de un profile su imagen */}
      <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
					{/* Esta parte del modal muestra el nombre del chat */}
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
						{/* Nombre del chat */}
            {selectedChat.chatName}
          </ModalHeader>
					{/* Icono de cerrar el modal con funcionalidad incluida de chakra ui */}
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
						{/* Aqui va un cuadro con todos los usuarios del chat seleccionados mapeados y renderizados  en medallas de usuarios  previamente estilzados con chakra ui */}
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
									// Le pasamos coomo prop una funcion que hace los llamados al backend para eliminar usuarios del chat grupal en la BD
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
						{/* Lo siguiente es un input con el nombre del chat y donde al escribir ahi y al seleccionar el boton de update al lado podremos cambiar su nombre actual por el del input */}
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
								// Le pasamos el state con el nombre del chat 
                value={groupChatName}
								// El valor que pasemos al input lo tendra el state correspondiente
                onChange={(e) => setGroupChatName(e.target.value)}
              />
							{/* Boton para ejecutar el cambio de nombre en el chat grupal */}
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
								// Ejecutamos la funcion que hace llamado al backend para modificar atributos del chat en este caso su nombre
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
						{/* Otro input para agregar los nombres de los usuariios a agregar al grupo de la BD */}
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
								// Con handleSearch buscamos usuarios en la BD de usuarios va en un event onChange porque la funcion se llama cada vez que ecribamos algo a diferencia de handleRename que se llama al hacer click en el boton rename 
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
						{/* Aqui renderizaremos los usuarios de la BD cuyas coincidencias se encuantren en las escritas en el input */}
						{/* Si loading es true renderiza un spiner */}
            {loading ? (
              <Spinner size="lg" />
							// Si no hay carga de loading renderizamos los usuarios mediante el state searchResult en el cual guardaremos al llamar al backend
            ) : (
              searchResult?.map((user) => (
                // <UserListItem
                //   key={user._id}
                //   user={user}
                //   handleFunction={() => handleAddUser(user)}
                // />
                <></>
              ))
            )}
          </ModalBody>
          <ModalFooter>
						{/* en la parte final renderizamos un boton donde nos saldremos del chat mediante una llamada al backend pasandole como argumento el usuario logeado quien abandonara el grupo */}
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModel