import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
 
const connectDB = async()=>{
    try {
        const connectionInstant = await mongoose.connect(`${process.env.MONGODB_URI}/youtube`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstant.connection.host}`);
    } catch (error) {
        console.log('MONGODB connection error', error)
        process.exit(1)
    }
}


export default connectDB