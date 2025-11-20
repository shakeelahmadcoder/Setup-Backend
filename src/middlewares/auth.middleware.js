import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

export const verifyToken = async (req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            return res.status(401).json({message: "Unauthorized request"})
        }
        
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
        
        if(!user){
            return res.status(401).json({message: "Invalid Access Token"})
        }
    
        req.user = user
        next()
    } catch (error) {
        console.log(error.message)
            return res.status(401).json({message: error.message}) 
    }
    
}