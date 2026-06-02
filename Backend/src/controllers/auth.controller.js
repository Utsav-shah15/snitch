const User=require("../models/user.models");
const jwt=require("jsonwebtoken");
const config=require("../config/config");

async function sendToken(user,res,message){
    const token=jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:"7d"});

    res.cookie("token",token);

    res.status(200).json({
        message,
        user:{
            id:user._id,
            fullName:user.fullName,
            email:user.email,
            contactNumber:user.contactNumber,
            role:user.role
        }
    })
}

async function registerUser(req,res) {
    const {fullName,email,contact,password}=req.body;

    try{
         const existingUser=await User.findOne({$or:[{email},{contactNumber:contact}]});
         if(existingUser){
            return res.status(400).json({error:"Email or contact number already exists"});
         }

         const newUser=await User.create({fullName,email,contact,password});

         sendToken(newUser,res,"user registered successfully");
    }catch(error){
        res.status(500).json({error:"Server Error"});
    }
}

module.exports={
    registerUser
}