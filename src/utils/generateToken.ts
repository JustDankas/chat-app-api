import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Types } from 'mongoose';
dotenv.config()

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'secondary'

export default function generateToken(username:string,email:string,_id:string){
    return jwt.sign({username,email,_id},ACCESS_TOKEN)
}