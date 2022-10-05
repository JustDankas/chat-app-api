import express,{Request,Response} from 'express';
import { Message } from '../models/MessageModel';

const router = express.Router()

router.get('/:chatId',async (req:Request<{chatId:string},{},{},{}>,res:Response)=>{
    try {
        const messages = await Message.find({chatId:req.params.chatId}).populate('sender',{email:1,username:1,id:1})
        res.status(200).json(messages)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post('/',async (req:Request<{},{},{content:string,chatId:string,sender:{username:string,email:string,_id:string}},{}>,res:Response)=>{
    try {
        const {content,chatId,sender} = req.body
        const message = await Message.create({
            content,
            chatId,
            sender:sender._id
        })
        await message.save()
        res.status(200).json({
            chatId:message.chatId,
            content:message.content,
            sender:sender,
            createdAt:message.createdAt,
            updatedAt:message.updatedAt,
            _id:message._id,
            
        })
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.delete('/',async (req:Request,res:Response)=>{
    try {
        await Message.deleteMany()
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

export {router as messageRoute}