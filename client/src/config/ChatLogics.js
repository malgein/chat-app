//Funcion necesaria para selccionar el chat
export const getSender = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};

// Sirve para mostrar los datos del usuario con el que se chatea en un modal con los datos del mismo
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};