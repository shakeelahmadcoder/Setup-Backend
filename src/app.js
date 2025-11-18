import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
const app = express()

app.use(cors())
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res)=>{
    res.send("Home")
})

app.use("/api/users", userRouter)
export{app} 