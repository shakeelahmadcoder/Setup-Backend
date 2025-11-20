import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(upload.fields([{name: "avtar", maxCount: 1}, {name: "coverImage", maxCount: 1}]), registerUser)
userRouter.route("/login").post(loginUser)

// secure routes 
userRouter.route("/logout").post(verifyToken,logoutUser)

export default userRouter 