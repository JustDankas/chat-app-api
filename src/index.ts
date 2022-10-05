import express,{Request,Response,NextFunction, urlencoded} from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser';
import {Server} from 'socket.io';
import cors from 'cors';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app)

app.use(cookieParser());
app.use(cors());

const io = new Server(server,{
    cors:{
        origin: "*"
    }
})

const username = process.env.USER_DB
const password = process.env.PASSWORD

const uri = `mongodb+srv://${username}:${password}@myappcluster.kbtu0pi.mongodb.net/?retryWrites=true&w=majority`
async function connect(){
    try {
        await mongoose.connect(uri)
        console.log('Connected to database!')
    } catch (error) {
        console.log(error)
    }
}

connect()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

interface IOnlineUser{
    id:string,
    socketId:string,
}

type IUser = {
    username:string,
    email:string,
    _id:string
}

interface IChat{
    _id:string,
    members:IUser[]
}

let onlineUsers:IOnlineUser[] = []

io.on('connection',(socket)=>{
    
    socket.on('login',(user:IUser)=>{
        console.log(user)
        if(!onlineUsers.some(usr=>usr.id==user._id)){
            onlineUsers.push({
                id:user._id,
                socketId:socket.id
            })
        }
    })

    socket.on('new-chat',(newChat:IChat,cb)=>{
        const findId = newChat.members[1]._id
        const receiver = onlineUsers.find(user=>user.id==findId)
        if(receiver){
            socket.to(receiver?.socketId).emit('get-new-chat',newChat)
        }
        cb()
    })

    socket.on('send-msg',(msg,chatId,cb)=>{
        socket.to(chatId).emit('receive-msg',msg,chatId)
        cb('Message Sent!')
    })

    socket.on('join-chat',chatId=>{
        console.log(socket.id+' joined '+chatId)
        socket.join(chatId)
    })

    socket.on('group-chat-change',(groupChat,cb)=>{
        socket.to(groupChat._id).emit('update-group-chat',groupChat)
        cb()
    })

    socket.on('group-chat-delete',(groupId,cb)=>{
        socket.to(groupId).emit('group-chat-deleted',groupId)
        cb()
    })

    socket.on('disconnect',()=>{
        onlineUsers = onlineUsers.filter(user=>user.socketId!==socket.id)
    })
})

import {userRouter} from './routes/UserRoute'
app.use('/users',userRouter)

import {chatRouter} from './routes/ChatRoute'
app.use('/chat',chatRouter)

import {messageRoute} from './routes/MessageRoute'
app.use('/message',messageRoute)

import {groupChatRoute} from './routes/GroupChatRoute'
app.use('/groupChat',groupChatRoute)

// import {RoomRouter} from './routes/RoomRouter'
// app.use('/room',RoomRouter)


server.listen(process.env.PORT || 5000,()=>{
    console.log(`App Listening to port ${process.env.PORT || 5000}`)
})