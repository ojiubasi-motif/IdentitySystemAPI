import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        maxlength:200,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        maxlength:200,
        unique:true
    },
    first_name:{
        type:String,
        required:true,
       
    },
    last_name:{
        type:String,
        required:true,
        
    },
    is_admin:{type:Boolean, default:false},
    password:{
        type:String,
    }
},{ 
    timestamps:true
});

export default mongoose.models.Auth || mongoose.model("Auth", AuthSchema);