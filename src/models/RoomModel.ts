import mongoose, { Schema, Types } from "mongoose";

interface IRoom{
    users: string[],
    messages:Types.ObjectId[]
}

const RoomSchema = new mongoose.Schema<IRoom>({
    users:{
        type: [String],
    },
    messages:{
        type: [Schema.Types.ObjectId],
        ref:'Message',
        default:[]
    }
})

const Room = mongoose.model('Room',RoomSchema)
export {Room}