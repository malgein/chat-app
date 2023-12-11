const express = require('express')
const chats = require('./data/data')
const dotenv = require('dotenv')
const cors = require('cors')

const app = express()
dotenv.config()

app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}))

app.get('/' , (req, res) => {
  res.send('Api is working')
})

app.get('/api/chat', (req, res) =>{
	res.send(chats)
})

app.get('/api/chat/:id', (req, res) => {
	const sigleChat = chats.find(chat => chat._id === req.params.id)

	res.send(sigleChat)
})

const PORT = process.env.PORT || 5000


app.listen(PORT, console.log('Server start in port 5000'))