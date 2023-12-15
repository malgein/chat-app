const express = require('express')
const chats = require('./data/data')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const chatRoutes = require('./routes/chatRoutes')



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

app.use('/api/chat', chatRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000


app.listen(PORT, console.log('Server start in port 5000'))