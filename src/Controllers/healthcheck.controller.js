import {ApiResponse} from "../Utils/apiresponse.js";

import {asynchandler} from "../Utils/asyncHandler.js"

const healthcheckController=asynchandler(async(req,res,next)=>{
    res
    .status(200)            
    .json(new ApiResponse(200,"API is healthy",null))
})

export {healthcheckController};