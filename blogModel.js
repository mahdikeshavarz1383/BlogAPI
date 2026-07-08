const mongoose = require("mongoose")
const postSchema=new mongoose.Schema({
     postname: {
            type:String,
            required:true}
            ,
        payload:{
            type:string
        }
})