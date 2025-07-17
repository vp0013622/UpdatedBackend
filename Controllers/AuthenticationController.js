import { UsersModel } from "../Models/UsersModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import * as dotenv from 'dotenv'
import { emailRegex, SALT } from "../config.js"
import { RolesModel } from "../Models/RolesModel.js"
dotenv.config()


const Login = async (req, res) => {
    try {
        const {email, password} = req.body
    
        if(!email || !password){
            return res.status(400).json({
                    message: 'bad request',
                    data: req.body
                })
        }
        
        const isEmailValidationTrue = emailRegex.test(email);
        if(!isEmailValidationTrue){
            return res.status(400).json({
                message: 'email is not valid',
                data: req.body
            })
        }
        
        var user = await UsersModel.findOne({email})
        if(!user){
            return res.status(404).json({
                    message: 'user not found',
                    data: req.body
                })
        }
        if(!user.published){
            return res.status(403).json({
                    message: 'user deactivated by admin, contact admin support',
                    data: req.body
                })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                message: 'incorrect email and password',
                data: req.body
            })
        }
        const userRoleDoc = await RolesModel.findById(user.role);
        if (!userRoleDoc) {
            return res.status(401).json({ message: "Access denied: role not found" });
        }

        var token = jwt.sign({id: user._id, role: userRoleDoc.name}, process.env.JWT_SECRET, {expiresIn:"1d"})
        user.password = ""
        return res.status(200).json({
            message: 'user logged in successfully, session will be ended on next 24H',
            token: token,
            data: user
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export {
    Login
}