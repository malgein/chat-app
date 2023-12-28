import React from 'react'
import { ChatState } from '../context/chatProvider'
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
	isSameUser
} from "../config/ChatLogics";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";



// Componente  que contiene todos los mensajes de los chats renderizados
// Los mensajes son enviados por props desde singleChat.js
const ScrollableChat = ({messages}) => {

	// Nos traemos el usuario logeado
	const { user } = ChatState();

  return (
		<ScrollableFeed>
			{/*Si hay mensajes renderizamos los mismos siguiendo la logcia de si son del mismo remiente o si es el ultimo mensajes para el renderizado o no de las iemgenes profiles */}
			 {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
						{/* Verifica si es el mismo remitente */}
            {(isSameSender(messages, m, i, user._id) ||
						// Verifica si es el ultimo mensaje
              isLastMessage(messages, i, user._id)) && (
								// Si alguna de las dos anteriores es cierta devuelve informacion del usuario a traves de un avatar
								// Despliega el nombre del usuario 
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
								{/* despliega la imagen del usuario */}
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
						{/* Contiene el texto del mensaje  */}
						<span
              style={{
								// Siguiente linea si el mensaje pertenece a; usuario logeado es de un color si no lo es tiene otro color
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
								// Si es otro usuario tienen margenes diferentes estan a la lados desiguales
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
								// Si es un usuario diferente el margen superior es mayor
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
							{/* Contenido del mensaje */}
              {m.content}
            </span>
					</div>
        ))}
		</ScrollableFeed>
  )
}

export default ScrollableChat