const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//Controlador que trae nuestro chat de uno a uno
// En resumen, esta función busca si ya existe un chat entre el usuario actual y el usuario con el ID proporcionado. Si existe, devuelve ese chat. Si no existe, crea un nuevo chat, lo guarda en la base de datos y luego devuelve ese nuevo chat.
const accessChat = asyncHandler(async (req, res) => {
	//queremos hacer que si existe un chat con el sig user id queremos traerlo, si no queremos crearlo
  const { userId } = req.body;

	//Si no existe userID envia un mensaje con el error
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
//buscamos el chat en la BD el chat con las condiciones de que no sea grupal
  var isChat = await Chat.find({
    isGroupChat: false,
		//and es un operador que eimplica que ambas condiciones tienen qu ser verdaderas dentro de las llaves
    $and: [
			//las condiciones son buscar el chat relacionado al usuario que esta logeado
      { users: { $elemMatch: { $eq: req.user._id } } },
			//o buscar el chat relacionado al id que estamos enviando
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
	//linea de codigo  que no trae de users el password
    .populate("users", "-password")
		//Linea de codigo que trae los ultimos mensajes
		// Se populan los datos de usuarios (excepto la contraseña) y el último mensaje del chat
    .populate("latestMessage");

		// Se vuelve a popular el campo "latestMessage.sender" con la información de nombre, imagen y correo electrónico del remitente
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

	// Si ya existe un chat, se envía el primer chat encontrado como respuesta
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
		 // Si no existe un chat, se crea un nuevo objeto de chat y se intenta guardarlo en la base de datos
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

		try {
      // Se crea el nuevo chat en la base de datos
      const createdChat = await Chat.create(chatData);
      // Se obtiene el chat completo (populando los datos de usuarios) y se envía como respuesta
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      // Si hay un error al crear el chat, se devuelve un estado de respuesta 400 y se lanza un error con el mensaje correspondiente
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// Controlador para obtener todos los chats de un usuario
// En resumen, este controlador busca todos los chats en los que el usuario actual está presente, carga datos adicionales (usuarios, administrador del grupo y último mensaje) utilizando el método .populate(), ordena los resultados por la fecha de actualización, y finalmente envía los resultados poblados al cliente. Al igual que en el controlador anterior, se utiliza el método .populate() para cargar información adicional y facilitar su uso en el código posterior.
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Consulta a la base de datos para encontrar todos los chats en los que el usuario actual (req.user) está presente
		// El operador $elemMatch se utiliza en MongoDB para buscar documentos que contengan al menos un elemento que coincida con los criterios especificados dentro de un array.
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      // Se poblaron los datos de los usuarios (excepto la contraseña), el administrador del grupo (si es un chat de grupo),
      // y el último mensaje en cada chat
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      // Se ordenan los resultados por la fecha de actualización en orden descendente
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        // Se vuelve a popular el campo "latestMessage.sender" con la información de nombre, imagen y correo electrónico del remitente
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        // Se envían los resultados poblados como respuesta al cliente
        res.status(200).send(results);
      });
  } catch (error) {
    // Si hay un error, se devuelve un estado de respuesta 400 y se lanza un error con el mensaje correspondiente
    res.status(400);
    throw new Error(error.message);
  }
});

// Controlador para crear y devolver un chat grupal en la base de datos
const createGroupChat = asyncHandler(async (req, res) => {
  // Verificar si se proporcionaron los campos necesarios en el cuerpo de la solicitud
  //En el frontend serian los usuarios que conformaran el grupo y el nombre del chat
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  // Convertir la cadena de usuarios JSON en un array
  //El frontend enviara la lista de usuarios en formato .stringify por eso hay que parsearla
  var users = JSON.parse(req.body.users);

  // Verificar que haya al menos dos usuarios para formar un chat grupal
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Agregar al usuario actual al array de usuarios del chat grupal
  users.push(req.user);

  try {
    // Crear un nuevo chat grupal en la base de datos
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // Obtener el chat grupal completo (populando los datos de usuarios y el administrador del grupo)
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // Enviar el chat grupal completo como respuesta al cliente
    res.status(200).json(fullGroupChat);
  } catch (error) {
    // Si hay un error al crear el chat grupal, devolver un estado de respuesta 400 y lanzar un error con el mensaje correspondiente
    res.status(400);
    throw new Error(error.message);
  }
});

// Controlador para modificar el nombre de un chat grupal en la base de datos
const renameGroup = asyncHandler(async (req, res) => {
  // Extraer el chatId y el nuevo chatName del cuerpo de la solicitud
  const { chatId, chatName } = req.body;

  // Utilizar el método findByIdAndUpdate de Mongoose para actualizar el chat en la base de datos
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      //new siginifica que devolvera el nuevo valor del nombre del chat, si no lo ponemos devolvera el antiguo
      new: true,
    }
  )
    // Populando los datos de usuarios y el administrador del grupo en el chat actualizado
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // Verificar si el chat fue encontrado y actualizado correctamente
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Si el chat se encontró y actualizó correctamente, enviar el chat actualizado como respuesta al cliente
    res.json(updatedChat);
  }
});

// Controlador para eliminar un usuario de un chat grupal en la base de datos
const removeFromGroup = asyncHandler(async (req, res) => {
  // Extraer el chatId y el userId del cuerpo de la solicitud
  const { chatId, userId } = req.body;

  // Verificar si el solicitante es un administrador del grupo (no se implementa en el código proporcionado)

  // Utilizar el método findByIdAndUpdate de Mongoose para eliminar el usuario del array de usuarios en el chat
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId }, // Utilizando el operador $pull para eliminar el userId del array de usuarios
    },
    {
      new: true,
    }
  )
    // Populando los datos de usuarios y el administrador del grupo en el chat actualizado
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // Verificar si el chat fue encontrado y actualizado correctamente
  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Si el chat se encontró y actualizó correctamente, enviar el chat actualizado como respuesta al cliente
    res.json(removed);
  }
});

// Controlador para agregar usuarios a un chat grupal en la base de datos
const addToGroup = asyncHandler(async (req, res) => {
  // Extraer el chatId y el userId del cuerpo de la solicitud
  const { chatId, userId } = req.body;

  // Verificar si el solicitante es un administrador del grupo (no se implementa en el código proporcionado)

  // Utilizar el método findByIdAndUpdate de Mongoose para agregar el usuario al array de usuarios en el chat
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId }, // Utilizando el operador $push para agregar el userId al array de usuarios
    },
    {
      new: true,
    }
  )
    // Populando los datos de usuarios y el administrador del grupo en el chat actualizado
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // Verificar si el chat fue encontrado y actualizado correctamente
  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Si el chat se encontró y actualizó correctamente, enviar el chat actualizado como respuesta al cliente
    res.json(added);
  }
});


module.exports={accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup}
