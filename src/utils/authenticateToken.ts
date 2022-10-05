import {Request,Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

export default function authenticateToken(req:Request<{cookie:string},{},{},{}>,res:Response,next:NextFunction){
    
    const session = req.headers.cookie?.split('=')[1]
    if(session){
        jwt.verify(session,process.env.ACCESS_TOKEN || 'secondary', (err,user)=>{
            if(err) return res.sendStatus(403)
            return res.status(200).json(user)
        })
    }
    next()
}