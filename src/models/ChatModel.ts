import mongoose, { Schema, Types } from "mongoose";

interface IChat {
    members:Types.ObjectId[]
}

const ChatSchema =  new mongoose.Schema<IChat>({
    members:{
        type:[Schema.Types.ObjectId],
        ref:'User'
    }
})

const Chat = mongoose.model('Chat',ChatSchema)

export {Chat}