const express=require("express");
const app=express();
const port=3000;
const bcryptjs = require("bcryptjs")
const dotenv=require("dotenv")
const AppError = require("./error")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const User=require("./userModel")
const Blog=require("./blogModel")
app.use(express.json())
const SECRET = "mahdi_secret_key";
//....................................................
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB! ✅"))
  .catch((err) => console.log("Error:", err))
  //Middleware for error handling
  const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]
  if(!token) return next(new AppError("no token", 401))
  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch(err) {
    next(new AppError("token is not valid", 401))
  }
}
//...............................................................
app.post("/register",async(req,res,next)=>{
    try{
        const {username,password}=req.body
        if(!username|| !password){return res.status(400).json({message:"please enter everything"})}
        const hashedPassword= await bcryptjs.hash(password, 10)
    const newUser = new User({username, password: hashedPassword})
    await newUser.save()
    res.status(201).json({message: "successfully"})
    }
    catch(err) {
    next(err)
  }
}) 
//............................................................
app.post("/login",async(req,res,next)=>{
    try{
        const {username, password} = req.body
    const user = await User.findOne({username})
    if(!user) throw new AppError("user not found", 404)
    const isMatch = await bcryptjs.compare(password, user.password)
    if(!isMatch) throw new AppError("password is wrong", 400)
    const token = jwt.sign({id: user._id, username: user.username}, SECRET, {expiresIn: "1h"})
    res.json({message: "logged in", token})

    }
    catch(err) {
    next(err)
  }
})
//...................................................................
app.get("/blogs",async(req,res,next)=>{
  try{
      const blogs = await Blog.find({user: req.user.id})
    res.json({blogs})
  } catch(err) {
    next(err)
  }
})
//.....................................................................
app.post("/blogs", verifyToken, async (req, res, next) => {
  try {
    const {postname,payload} = req.body
    if(!postname) throw new AppError("enter postname", 400)
    const newPost = new Blog({title: postname, payload, user: req.user.id})
    await newPost.save()
    res.status(201).json({message: "added", newPost})
  } catch(err) {
    next(err)
  }
})
//............................................................................
app.put("/blogs/:id", verifyToken, async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {new: true})
    if(!blog) throw new AppError("task not found", 404)
    res.json({message: "updated", blog})
  } catch(err) {
    next(err)
  }
})
//................................................................................
app.delete("/blogs/:id", verifyToken, async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if(!blog) throw new AppError("task not found", 404)
    res.json({message: "deleted"})
  } catch(err) {
    next(err)
  }
})
//..............................................................................
//catch and try
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"
  res.status(statusCode).json({
    success: false,
    message
  })
})
app.listen(port,()=>{
 console.log("server is running on port 3000")
})