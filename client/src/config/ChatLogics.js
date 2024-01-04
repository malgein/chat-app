//Funcion necesaria para selccionar el chat
export const getSender = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
};

// Sirve para mostrar los datos del usuario con el que se chatea en un modal con los datos del mismo
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

// funcion que se encarga de verificcar el largo de los mensajes y al seguir existiendo mensajes en scrollableChat estos pertenezcan a diferentes usuarios o no para el renderizado de la foto profile
export const isSameSender = (messages, m, i, userId) => {
  // Chequeriamos si los mensajes pertenecen o no al usuario logeado pues de ser asi no renderizamos la imgen profile
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

// funcionque corroborara el ultimo mensaje del chat de un usuario y verifica si que no sobrepase el length de los mensajes del usuario
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

// Logica para separar dandole grados de margen un chat del otro de acuerdo pertenezca o no a un usuario o a otro, es decir hace que los mensajes del usuario logeado aparezcan del lado derecho y los mensajes del tro usuario del lado contrario o viceversa
export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

