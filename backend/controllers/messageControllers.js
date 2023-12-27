// PAquete para manejar eventos asincronos
const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    // buscamos en la BD en el modelo chats el chat que se esta buscando mediante el id que se envia por prams
    const messages = await Message.find({ chat: req.params.chatId })
    // Despues populamos el chat y los remitantes 
      .populate("sender", "name pic email")
      .populate("chat");
      // Y finalmente lo enviamos 
    res.json(messages);
    // Lidiamos con el errror
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
// Controlador que envia el mensaje y lo guarda en la BD
const sendMessage = asyncHandler(async (req, res) => {
  // Tomamos del body el contenido y el id del chat al cual le pasaremos el mensaje
  const { content, chatId } = req.body;

  // Verificamos si existe un contenido o un id de algun chat al cual pasarle el mensaje
  if (!content || !chatId) {
    // SI ese el es caso enviamos un mesaje de error
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
// Creamos el mensaje como tal
  var newMessage = {
    // Este es el remitente
    sender: req.user._id,
    // Este el contenido que nos llega
    content: content,
    // y este el chat 
    chat: chatId,
  };

  try {
    // Creamos el mensaje mediante el metodo create de mongo pasandole los datos de la variable newMessage
    var message = await Message.create(newMessage);
    // Rellenamos el sender del modelo user que se relaciona con el modelo message y ahi le damos solo los valores de name y pic del  usuario
    message = await message.populate("sender", "name pic")
    // rellenamos todo lo que hay dentro del objeto chat para relacionado con message
    message = await message.populate("chat")
    // Aqui reemplazamos el ultimo mensaje por el ultimo escrito por el usuario y lo estaremos reemplazando constantemente
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
// Buscamos el chat por el id y lo modificamos y en su atributo de ulyimo mensje pasamos el mensaje del body coomo tal siempre el ultimo se estara actualizando
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    //Al final si todo sale bien devolvemos el mesaneje como tal que estabamos escribiendo
    res.json(message);
    // Lidiamos con el error
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };