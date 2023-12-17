import React, {useEffect , useState} from 'react'
import axios from 'axios'
import { ChatState } from '../../context/chatProvider'
import { Box } from '@chakra-ui/react'
import SideDrawer from '../miscellaneous/SideDrawer'
import ChatBox from '../ChatBox'
import Mychats from '../Mychats'

const ChatPage = () => {

	const {user} = ChatState()

	// const [chats, setChats] = useState([])

	// const fethChats = async() => {
	// 	const result = await axios.post('http://localhost:5000/api/chat/')

	// 	setChats(result.data)
	// }

	// useEffect(() => {
	// 	fethChats()
	// }, [])
	
	console.log(user)

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column"}}>
			 {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <Mychats  />}
        {user && (
          <ChatBox  />
        )}
      </Box>
		</div>
  )
}

export default ChatPage