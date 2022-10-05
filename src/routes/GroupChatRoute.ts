import express,{Request,Response} from 'express';
import { Chat } from '../models/ChatModel';
import { GroupChat } from '../models/GroupChatModel';
import { Message } from '../models/MessageModel';
import { User } from '../models/UserModel';

const router = express.Router()

interface IUser {
    username: string,
    email: string,
    _id:string
}

router.get('/:id',async (req:Request<{id:string},{},{},{}>,res:Response)=>{
    try {
        const gcs = await GroupChat.find({members:req.params.id}).populate('members',{username:1,_id:1,email:1})
        res.status(200).json(gcs)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get('/members/:groupId',async (req:Request<{groupId:string},{},{},{}>,res:Response)=>{
    try {
        const gc = await GroupChat.findById(req.params.groupId).populate('members',{username:1,_id:1,email:1}).populate('admin',{username:1,email:1,_id:1})
        res.status(200).json(gc)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.put('/groupName',async (req:Request<{},{},{groupName:string,_id:string},{}>,res:Response)=>{
    try {
        const {groupName,_id} = req.body
        const updatedGC = await GroupChat.findByIdAndUpdate(_id,{groupName},{new:true}).populate('admin',{username:1,email:1,_id:1}).populate('members',{username:1,email:1,_id:1})
        res.status(200).json(updatedGC)
        // await gc?.updateOne({groupName:groupName})
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.put('/:gcId/members/add',async (req:Request<{gcId:string},{},{userId:string},{}>,res:Response)=>{
    try {
        const {userId} = req.body
        const gc = await GroupChat.findOneAndUpdate({_id:req.params.gcId,members:{$nin:userId}},{$push:{members:userId}},{new:true}).populate('admin',{username:1,email:1,_id:1}).populate('members',{username:1,email:1,_id:1})
        if(gc){
            res.status(200).json(gc)
        }
        else{
            res.sendStatus(404)
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.put('/:gcId/members/remove',async (req:Request<{gcId:string},{},{userId:string},{}>,res:Response)=>{
    try {
        const {userId} = req.body
        const updatedGC = await GroupChat.findByIdAndUpdate(req.params.gcId,{$pull:{members:userId}},{new:true}).populate('admin',{username:1,email:1,_id:1}).populate('members',{username:1,email:1,_id:1})
        if(updatedGC){
            res.status(200).json(updatedGC)
        }
        else{
            res.sendStatus(404)
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post('/',async (req:Request<{},{},{creator:IUser},{}>,res:Response)=>{
    try {
        const {creator} = req.body
        const gc = await GroupChat.create({
            members:[creator._id],
            admin:creator._id,
            groupName:creator.username
        })
        await gc.save()
        await gc.populate('admin',{username:1,email:1,_id:1})
        await gc.populate('members',{username:1,email:1,_id:1})
        res.status(200).json(gc)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.delete('/:id',async (req:Request<{id:string},{},{},{}>,res:Response)=>{
    try {
        const {id} = req.params
        await GroupChat.findByIdAndDelete(id)
        await Message.deleteMany({chatId:id})
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

export {router as groupChatRoute}