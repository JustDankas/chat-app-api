import mongoose, { Schema, Types } from "mongoose";

interface IMessage{
    chatId:Types.ObjectId,
    sender: Types.ObjectId,
    content:string,
    createdAt: Date,
    updatedAt: Date
}

const MessageSchema = new mongoose.Schema<IMessage>({
    chatId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:''
    },
    sender:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    content:{
        type: String,
        required:true
    },
    createdAt:{
        type: Schema.Types.Date,
        default:()=>new Date(Date.now())},
    updatedAt:{
        type: Schema.Types.Date,
        default:()=>new Date(Date.now())}
}
)

const Message = mongoose.model('Message',MessageSchema)

export {Message}