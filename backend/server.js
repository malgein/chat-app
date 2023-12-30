const express = require('express')
const chats = require('./data/data')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')



const app = express()
dotenv.config()
connectDB()

app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}))

//Le dice a nuestra aplicacion del backend que pueda usar elementos json
app.use(express.json())

app.get('/' , (req, res) => {
  res.send('Api is working')
})

// app.get('/api/chat', (req, res) =>{
// 	res.send(chats)
// })

// app.get('/api/chat/:id', (req, res) => {
// 	const sigleChat = chats.find(chat => chat._id === req.params.id)

// 	res.send(sigleChat)
// })

//Hace que todas las rutas empiezen pos /api/user
app.use('/api/user', userRoutes)
// Rutas del chat
app.use('/api/chat', chatRoutes)
// rutas de mensajes
app.use("/api/message", messageRoutes);



app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000


const server = app.listen(PORT, console.log('Server start in port 5000'))

const io = require("socket.io")(server, {
	//Se refiere al tiempo de espera mientras esta inactivo si en 1 minuto ningun usuario hace uso se cierra por proteccion
	pingTimeout: 60000,
	cors: {
	  origin: "http://localhost:3000",
	  // credentials: true,
	},
  });

  io.on("connection", (socket) => {
	console.log("Connected to socket.io");

	//Estamos creando un room uno por cada usuario
	// userData representa los datos del usuario 
	socket.on("setup", (userData) => {
    socket.join(userData._id);
		// console.log(userData._id)
    socket.emit("connected");
  });

	// crea un room para unirse el frontend
	socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

	// Funcionalidad para isTyping
	socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

	// room llamado new message
	socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

	// Funcionalidad para apagar el socket y que no consuma muchos recursos
	socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
    