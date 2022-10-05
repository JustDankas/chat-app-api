import mongoose, { Model, Schema, Types } from "mongoose";
import bcrypt from 'bcryptjs';

interface IUser {
    username: string,
    email: string,
    password: string,
}

interface userDocument extends IUser,mongoose.Document{
    matchPassword(password:string):Promise<boolean>
}

interface userModelInterface extends mongoose.Model<userDocument>{
    build(attr:IUser):userDocument
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }

})

userSchema.statics.build = async (attr: IUser) => {
    return await new User(attr)
}

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
})

userSchema.methods.matchPassword = async function(password:string){
    if(!password){
        return false
    }
    return await bcrypt.compare(password,this.password)
}

const User = mongoose.model<userDocument,userModelInterface>('User',userSchema)

export {User}