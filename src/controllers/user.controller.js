import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
export const registerUser = async (req, res)=>{
    const {fullName, username, email, password} = req.body;
    if(!fullName || !username || !email ||!password){
        return res.statu(401).json({message: "All fields are required"})
    }
    
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(!existedUser){
        return res.status(401).json({message: "User with emailor user already exists"})
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
        return res.status(500).json({message: "Somethinb Went wrong while registering the user"})
    }

    return res.status(201).json({createdUser, message:"User Created Successfully"})
}