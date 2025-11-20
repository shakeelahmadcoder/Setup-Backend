import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
export const registerUser = async (req, res)=>{
    
    const {fullName, username, email, password} = req.body;

    if(!fullName || !username || !email ||!password){
        return res.status(401).json({message: "All fields are required"})
    }
    
    const existedUser =  User.findOne({
        $or: [{username}, {email}]
    })

    if(!existedUser){
        return res.status(401).json({message: "User with email or user already exists"})
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    
    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avtarLocalPath){
        return res.status(401).json({message: "Avtar file is required"})
    }

    const user = await User.create({
        fullName,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        return res.status(500).json({message: "Something Went wrong while registering the user"})
    }

    return res.status(201).json({createdUser, message:"User Created Successfully"})
}


const generateAccessAndRefereshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken() 
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        return res.status(401).json({message: error.message})
    }
}

export const loginUser = async (req, res)=>{

    const {email, username, password} = req.body

    if(!email){
        return res.status(401).json({message: "user name or email is required"})
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        return res.status(401).json({message: "User does not exist"})
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        return res.status(401).json({message: "Invalid user credentials"})
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

   return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json({
    loggedInUser,
    message: "User Loggedin Successfully"
  });

}

export const logoutUser = async(req, res)=>{
    await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken: undefined}}, {new: true})

    const options = {
        httpOnly: true,
        secure: true
    }

   return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json({message: "Loggout Successfully"});

}

export const refreshAccessToken = async(req, res)=>{
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        return res.status(401).json({message: "unothorized request"})
    }

    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)
    
    if(!user){
        return res.status(401).json({message: "Invalid Refresh Token"})
    }

    if(incommingRefreshToken !== user?.refreshToken){
        return res.status(401).json({message: "refresh token is expired or used"})
    }

    const options = {
        httpOnly: true,
        secure: true
    }
await generateAccessAndRefereshTokens(user._id)
   return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json({
    
    message: "User Loggedin Successfully"
  });
    
}