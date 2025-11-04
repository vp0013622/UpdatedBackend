import jwt from "jsonwebtoken"
import { RolesModel } from "../Models/RolesModel.js";
import { json } from "express";
import config from "../config/environment.js";

const AuthMiddelware = async(req, res, next)=>{
    let token;
    var authHeaders = ""
    authHeaders = req.headers.authorization
    if(!authHeaders){
        return res.status(401).json({
            message: "Access denied: No authorization header provided"
        })
    }
    if(authHeaders && authHeaders.startsWith('Bearer ')){
        token = authHeaders.split(" ")[1]
        if(!token){
            return res.status(401).json({
                message: 'No token provided',
                data:{}
            })
        }
        try{
            // Use JWT_SECRET from config instead of directly from process.env
            const jwtSecret = config.JWT_SECRET || process.env.JWT_SECRET;
            
            if (!jwtSecret) {
                return res.status(500).json({
                    message: 'Server configuration error',
                    error: 'JWT_SECRET is not configured'
                });
            }
            
            var decodedToken = jwt.verify(token, jwtSecret)
            var user = decodedToken //we put user in req param so we can use it further middelwares
            const userRoleDoc = await RolesModel.findOne({"name": user.role})
            //const userRoleDoc = await RolesModel.findOne({"name": { $regex: new RegExp(`^${user.role}$`, 'i') }})
            if (!userRoleDoc) {
                return res.status(401).json({ message: "Access denied: role not found" });
            }
            user.roleId = userRoleDoc._id //replacing role name with id
            req.user = user
            next()
        }
        catch(error){
            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                if (error.message === 'invalid signature') {
                    return res.status(401).json({
                        message: 'Invalid token: Token signature verification failed',
                        error: 'The token may have been signed with a different secret or is corrupted'
                    });
                }
                return res.status(401).json({
                    message: 'Invalid token',
                    error: error.message
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token expired',
                    error: 'Please login again'
                });
            }
            res.status(500).json({
                message: 'internal server error',
                error: error.message
            })
        }
    } else {
        return res.status(401).json({
            message: "Access denied: Invalid authorization format. Expected 'Bearer <token>'"
        })
    }
}



export{AuthMiddelware}