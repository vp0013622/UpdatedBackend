import jwt from "jsonwebtoken"
import { RolesModel } from "../Models/RolesModel.js";
import { json } from "express";

const AuthMiddelware = async(req, res, next)=>{
    let token;
    var authHeaders = ""
    authHeaders = req.headers.authorization
    if(!authHeaders){
        return res.status(401).json({
            message: "Access denied: role not found"
        })
    }
    if(authHeaders && authHeaders.startsWith('Bearer ')){
        token = authHeaders.split(" ")[1]
        if(!token){
            return res.status(401).json({
                message: 'No token',
                data:{}
            })
        }
        try{
            var decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            var user = decodedToken //we put user in req param so we can use it further middelwares
            const userRoleDoc = await RolesModel.findOne({"name": user.role})
            if (!userRoleDoc) {
                return res.status(401).json({ message: "Access denied: role not found" });
            }
            user.roleId = userRoleDoc._id //replacing role name with id
            req.user = user
            next()
        }
        catch(error){
            res.status(500).json({
                message: 'internal server error',
                error: error.message
            })
        }
    }
}



export{AuthMiddelware}