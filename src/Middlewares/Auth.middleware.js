import{User} from "../Models/User.model.js"
import { ApiError } from "../Utils/apierror.js"
import {asynchandler} from "../Utils/asyncHandler.js"
import jwt from "jsonwebtoken"



export const verifyJWT = asynchandler(async(req,res,next)=>{
    console.log("AUTH HEADER:", req.headers.authorization);
console.log("COOKIES:", req.cookies);

    const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401,"Unauthorize request")
    }
    try {
       const decodedToken = jwt.verify(token,process.env.ACCESS_SECRET)
      const user =  await User.findById(decodedToken?._id).select( "-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

       if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }
    req.user=user
    next()
    } 
   
    
    catch (error) {
        
        throw new ApiError(401,"Invalid Access Token request")
    
        
    }


})