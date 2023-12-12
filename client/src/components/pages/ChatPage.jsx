import React, {useEffect , useState} from 'react'
import axios from 'axios'

const ChatPage = () => {

	const [chats, setChats] = useState([])

	const fethChats = async() => {
		const result = await axios.get('http://localhost:5000/api/chat/')

		setChats(result.data)
	}

	useEffect(() => {
		fethChats()
	}, [])
	

  return (
    <div>
			{/* {console.log(chats)} */}
			{chats.map(chat => {
				return <div key={chat._id}>{chat.chatName}</div>
			})}	
		</div>
  )
}

export default ChatPage