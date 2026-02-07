import { Router } from "express";
import {
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

} from "../Controllers/auth.controller.js"
import  {
  userRegisterValidator,
  userLoginValidator,
  userCurrentPasswordChangeValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
} from "../Validators/index.js"
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { validate } from "../Middlewares/Validator.middleware.js";

const router = Router()

router.route("/register").post(userRegisterValidator(),validate,registerUser)
router.route("/login").post(userLoginValidator(),validate,login)


router.route("/refresh-token").post(refreshAccessToken)
router.route("/Forgot-password").post(userForgotPasswordValidator(),validate,  forgotPasswordRequest)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,  resetForgotPassword)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification)

router.route("/logout").post(verifyJWT ,logoutUser);
router.route("/current-user").post(verifyJWT ,getCurrentUser);
router.route("/change-password").post(verifyJWT , userCurrentPasswordChangeValidator(),validate ,changeCurrentPassword);


export default router;