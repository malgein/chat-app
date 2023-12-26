import { Box } from "@chakra-ui/layout";
// import "./styles.css";
// import SingleChat from "./SingleChat";
//Redux con los estados globales de la app
import { ChatState } from "../context/chatProvider";
import SingleChat from "./SingleChat";

// componente que representa en chat como tal, la seccion de chat

// fetchAgain es una funcion que se pasa por props y que se va a ejecutar para traer los chats del usuario actualizados
const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  // Necesitaremos el chat a seleccionar 
  const { selectedChat } = ChatState();

  return (
    <Box
    // si el usuario a seleccionado algun chat aparecera la seccion de chat con un flex cuando se reduzca el tamaño de la pantalla, si no se ha seleccionado algun chat y se reduce la pantalla no aparecera el componente del chat
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
     <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;