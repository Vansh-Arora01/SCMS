import { asynchandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import {ApiError} from "../Utils/apierror.js";
import { User } from "../Models/User.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { College } from "../Models/College.model.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../Utils/mail.js";




const generateAccessandRefreshToken= async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken= refreshToken;
        await user.save();
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Error generating tokens");
        
    }
}


const registerUser= asynchandler(async(req,res,next)=>{
    const {name,email,password,college,role,enrollment,department}= req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEnrollment = enrollment.trim().toUpperCase();
    const existingUser= await User.findOne({email: normalizedEmail});
    if(existingUser){
        return next(new ApiError(400,"User with this email already exists"));
    }    
    const collegeDoc = await College.findOne({ name: college });
  if (!collegeDoc) {
    throw new ApiError(400, "Invalid college selected");
  }   
  if (role === "STAFF" && !department) {
   throw new ApiError(400, "Department is required for staff");
}
    
    const user = await User.create({
        name,
       email: normalizedEmail,
        password,
         college: collegeDoc.name,      // optional
    collegeId: collegeDoc._id ,
        role,
      enrollment: normalizedEnrollment,
        department,
    });

const {unhashedToken,hashedToken,tokenExpiry}= user.generateTemporaryToken();

user.emailVerificationToken= hashedToken;
user.emailVerificationExpiry= tokenExpiry;
await user.save({validateBeforeSave:false});
  console.log("Saved user token in DB (hashed):", user.emailVerificationToken);
    console.log(user)

    // here is the email version to see
    await sendEmail({
        email: user?.email,
        subject: "Please verify your Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            // GENERATION OF DYNAMIC LINKS
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`
        ),

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while register a user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered SuccessFully and verification Email is sent on Your Email"
            ),
        )

});


const verifyEmail = asynchandler(async(req,res,next)=>{
    const {verificationToken} = req.params;
    if(!verificationToken){
        return res.status(400).json(
            new ApiError(400,"Email verification Token is missing !!")
        )
    }
    const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

    console.log("hashed Token :" , hashedToken);

    const user = await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })

    if(!user){
        return res.status(400).json(
            new ApiResponse(400,"Email verification Token Is Incorrect or expired!")
        )
    }
    user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  console.log("✅ Email verified for:", user.email);

  return res.status(200).json(
    new ApiResponse(
      200,
      { isEmailVerified: true },
      "Email verification is successful!"
    )
  );
});

// may ek button to resend that email through which email verify again
const resendEmailVerification = asynchandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User doesnot found Error")
    }
    if (user.isEmailVerified) {
        throw new ApiError(409, "User is already verified")
    }

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });


    await sendEmail({
        email: user?.email,
        subject: "Please verify your Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            // GENERATION OF DYNAMIC LINKS
             `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`
        ),

    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Mail is sent to your email id"
            )
        )

})



// const  login = asynchandler(async(req,res)=>{
//     const {name,email,password,role,enrollment}= req.body
//     if(!email){
//         throw new ApiError(400,"Email is required ")
//     }
//     if(!enrollment){
//         throw new ApiError(400,"Enrollment is required ")
//     }
//     const user = await User.findOne({ enrollment, email })
// .select("+password");

//     if(!user){
//         throw new ApiError(400,"User Doenot Exists")
//     }
//     const isPasswordValid = await user.isPasswordCorrect(password)

//     if(!isPasswordValid){
//         throw new ApiError(402,"Password is Wrong")
//     }

//     const {accessToken, refreshToken}= await generateAccessandRefreshToken(user._id)
//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry",);



//     const options ={
//         httpOnly:true,
//         secure : true,
//     }

//     return res 
//     .status(200)
//     .cookie("accessToken",accessToken,options)
//     .cookie("refreshToken",refreshToken,options)
//     .json(
//         new ApiResponse(
//             200,
//             {
//                 user:loggedInUser,
//                 accessToken,
//                 refreshToken
//             },
//             "User Logged In Successfully"
//         )
//     )

// })
const login = asynchandler(async (req, res) => {

    const { email, password, enrollment } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    if (!enrollment) {
        throw new ApiError(400, "Enrollment is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }
     // Normalize inputs: trim whitespace and enforce case sensitivity rules
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEnrollment = enrollment.trim().toUpperCase();
    console.log("Login Attempt:", {
        original: { email, enrollment },
        normalized: { normalizedEmail, normalizedEnrollment }
    });
     const user = await User.findOne({
        enrollment: normalizedEnrollment,
        email: normalizedEmail
    }).select("+password");

    if (!user) {
        // If user not found with both, check individually to give better error message
        const userByEmail = await User.findOne({ email: normalizedEmail });
        if (userByEmail) {
            throw new ApiError(400, "Invalid Enrollment Number");
        }

        const userByEnrollment = await User.findOne({ enrollment: normalizedEnrollment });
        if (userByEnrollment) {
            throw new ApiError(400, "Invalid Email Address");
        }

        throw new ApiError(404, "User Does Not Exist");
    }
    // console.log("REQ BODY:", req.body);
// console.log("Entered Password:", password);
// console.log("Stored Password:", user?.password);


    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is Wrong");
    }

    const { accessToken, refreshToken } = 
        await generateAccessandRefreshToken(user._id);
        

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    const options = {
        httpOnly: true,
        secure: true,
        // sameSite: "lax",    // ❗ NOT "none" on localhost
        sameSite: "none",    
  
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged In Successfully"
            )
        );
});




const logoutUser = asynchandler(async(req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },{new:true},
    );
     const options = {
        httpOnly: true,
        secure: true,

    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "UserLogged OUT"))
})


const getCurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current User Fetched Successfully"
            )
        )

})


const changeCurrentPassword = asynchandler(async(req,res)=>{

     const {password,newPassword} = req.body
     const user = await User.findById(req.user?._id);

     const isPasswordValid = await user.isPasswordCorrect(password)

     if(!isPasswordValid){
        throw new ApiError(400,"Invalid Old Password")
     }

     user.password = newPassword
     await user.save({validateBeforeSave:false})

     return res
     .status(200)
     .json(
        new ApiResponse (
            200,
            {},
            "Password changed Successfully"
        )
     )

})



const forgotPasswordRequest = asynchandler(async(req,res)=>{
  const { email, enrollment } = req.body

  const normalizedEnrollment = enrollment.trim().toUpperCase();

  const user = await User.findOne({ enrollment: normalizedEnrollment })

  if(!user){
    throw new ApiError(404,"User doen't exists")
  }

  const {unhashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken
  user.forgotPasswordExpiry = tokenExpiry

  await user.save({validateBeforeSave:false})

  await sendEmail({
        email: user?.email,
        subject: "Password reset Request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`
        ),
  })

  return res.status(200).json(
        new ApiResponse(
            200,{},"Password Reset link email is sent "
        )
  )
})




const resetForgotPassword = asynchandler(async(req,res)=>{
     const {resetToken} = req.params
     const {newPassword}=req.body

     let hashedToken = crypto
     .createHash("sha256")
     .update(resetToken)
     .digest("hex")


   const user=  await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {$gt:Date.now()}
     })
     if(!user){
        throw new ApiError (409,"Token is invalid or Expired")
     }
     user.forgotPasswordToken=undefined
     user.forgotPasswordExpiry=undefined

     user.password=newPassword
     await user.save({validateBeforeSave:false})

     return res 
     .status(200)
     .json(
        new ApiResponse (
            200,
            {},
            "Password Reset Successfully"
        )
     )
      

})



const refreshAccessToken = asynchandler(async(req,res)=>{
 const incomingRefreshToken =   req.cookies.refreshToken || req.body.refreshToken

 if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorised Access")
 }


 try {
  const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_SECRET)


  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401,"Invalid refresh token")
  }

  
  if(incomingRefreshToken!==user?.refreshToken){
    throw new ApiError(401,"Refresh token is Expired")
  }


  const options={
    httpOnly:true,
    secure:true, 
  }

    const {accessToken,refreshToken:newRefreshToken}=await generateAccessandRefreshToken(user._id)
    user.refreshToken=newRefreshToken
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access Refresh Token"
        )
    )
    

 } catch (error) {
     throw new ApiError(401,"Invalid refresh token")
    
 }
})


export {
    changeCurrentPassword,
    getCurrentUser ,
    logoutUser ,
    login,
    registerUser,

    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,

}