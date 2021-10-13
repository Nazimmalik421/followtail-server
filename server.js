const express = require('express')
// const { readdirSync } = require('fs')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const router = require('./routes/registrationAuth')
const postsRouter = require('./routes/publishPosts')
require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 8000;

const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    path: '/socket.io',
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-type']
    }
})

//DATABASE
mongoose.connect(process.env.DATABASE).then(() => console.log('DB CONNECTED')).catch(err => console.log('DB CONNECTION ERROR=>', err))

//MIDDLEWARES
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

//Defining cors so that I can access backend from frontend
app.use(cors({
    origin: [process.env.CLIENT_URL],
}))

//Loading routes
app.use('/api', router)
app.use('/api', postsRouter)

//AutoLoad Routes
// readdirSync('./routes').map(route => app.use('/api', require(`./routes/${route}`)))

//socket.io
io.on('connect', (socket) => {
    // console.log('SOCKET IO', socket.id)
    socket.on('new-post', (newPost)=>{
        // console.log('SOCKET IO NEW POST', newPost)
        socket.broadcast.emit('new-post', newPost)
    })
})

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/'))
}

http.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`)
})