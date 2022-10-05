import express,{Request,Response} from 'express';
import { Chat } from '../models/ChatModel';
import { Message } from '../models/MessageModel';
import { User } from '../models/UserModel';

const router = express.Router()

router.get('/:userId',async (req:Request<{userId:string},{},{},{}>,res:Response)=>{
    try {
        const chats = await Chat.find({members:req.params.userId}).populate('members')
        res.status(200).json(chats)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post('/',async (req:Request<{},{},{member1:string,member2:string},{}>,res:Response)=>{
    try {
        const {member1,member2} = req.body
        const existsChat = await Chat.findOne({members:{$all:[member1,member2]}})
        if(!existsChat){
            const chat = await Chat.create({members:[member1,member2]})
            await chat.save()
            await chat.populate('members')
            res.status(200).json({
                members:chat.members,
                _id:chat.id
            })
        }
        else{
            res.status(400).send('Chat already exists')
        }

    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.delete('/:chatId',async (req:Request<{chatId:string},{},{},{}>,res:Response)=>{
    try {
        await Chat.deleteOne({_id:req.params.chatId})
        await Message.deleteMany({chatId:req.params.chatId})
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.delete('/',async (req,res)=>{
    try {
        await Chat.deleteMany()
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

export {router as chatRouter}