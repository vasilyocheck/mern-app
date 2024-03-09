import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from 'dotenv'

configDotenv()

export const login = async(req, res) => {
    try{
        const user = await UserModel.findOne({ email: req.body.email})
        if(!user){
            return  res.status(404).json( {
                message: 'User not found.'
            })
        }

        const isPassValid = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if(!isPassValid) {
            return res.status(400).json({
                message: 'Invalid login or password.'
            })
        }

        const token = jwt.sign({
                _id: user._id,
            }, process.env.SECRET,
            {
                expiresIn: '30d',
            })

        const { passwordHash, ...userData } = user._doc

        res.json({...userData, token})

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed',
            error: 'Failed to log in.'
        })
    }
}

export const signUp = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10)
        const passHash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: passHash,
            avatarURL: req.body.avatarURL
        })

        const user = await doc.save()

        const token = jwt.sign({
                _id: user._id,
            }, process.env.SECRET,
            {
                expiresIn: '30d',
            })

        const { passwordHash, ...userData } = user._doc

        res.json({...userData, token})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed.',
            error: 'Failed to sign up.'
        })
    }
}

export const authMe = async(req, res) => {
    try{
        const user = await UserModel.findById(req.userId)
        if(!user){
            res.status(404).json({
                message: 'User not found.'
            })
        }

        const { passwordHash, ...userData } = user._doc

        res.json(userData)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed.',
            error: 'Not authorized.'
        })
    }
}