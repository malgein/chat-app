import React, {useEffect , useState} from 'react'
import axios from 'axios'
import { ChatState } from '../../context/chatProvider'
import { Box } from '@chakra-ui/react'
import SideDrawer from '../miscellaneous/SideDrawer'
import ChatBox from '../ChatBox'
import Mychats from '../Mychats'

const ChatPage = () => {

	const {user} = ChatState()
  // fetchAgain es una funcion que se pasa por props y que se va a ejecutar para traer los chats del usuario actualizados
  //*Hace que al modificar por ejemplo el nombre de los chatsse actualizen sus datos automaticamente
  const [fetchAgain, setFetchAgain] = useState(false);

	// console.log(user)

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column"}}>
      {/* Si existe un usuario muestra la sidebar */}
			 {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {/* Si el usuario existe devuelve los chats del usuario */}
        {user && <Mychats  fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        {/* Si el usuario existe devuelje a caja para chatear cuando se selecciona un chat */}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
		</div>
  )
}

export default ChatPage