import mongoose, { Schema, Types } from "mongoose";

interface IGroupChat{
    members:Types.ObjectId[],
    groupName:string,
    admin:Types.ObjectId
}

const GroupChatSchema = new mongoose.Schema<IGroupChat>({
    members:{
        type:[Schema.Types.ObjectId],
        ref:'User'
    },
    groupName:{
        type:String,
        required:true
    },
    admin:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

const GroupChat = mongoose.model('GroupChat',GroupChatSchema)

export {GroupChat}