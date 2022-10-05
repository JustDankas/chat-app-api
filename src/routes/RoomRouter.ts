import express,{Request,Response} from 'express';
import { Chat } from '../models/ChatModel';
import { Room } from '../models/RoomModel';
import { User } from '../models/UserModel';

const router = express.Router()

router.post('/',async (req:Request<{},{},{user1:string,user2:string},{}>,res:Response)=>{
    try {
        const {user1,user2} = req.body
        const user_1 = await User.findOne({username:user1})
        const user_2 = await User.findOne({username:user2})
        if(user_1 && user_2 && user_1!=user_2){
            const room = await (await Room.create({users:[user_1.username,user_2.username]}))
            await room.save()
            await User.updateMany({username:{$in:[user1,user2]}},{$push:{rooms:room._id}})

            res.sendStatus(200)
        }
        else{
            res.sendStatus(404)
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.delete('/',async (req:Request,res:Response)=>{
    try {
        await Room.deleteMany()
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

export {router as RoomRouter}