const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");

const ProductSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    price:{
        amount:{
            type:Number,
            required:true,
        },
        currency:{
            type:String,
            enum:["USD","EUR","GBP","INR"],
            required:true,
            default:"INR",
        }
    },
    images:[
        {
            url:{
                type:String,
                required:true,
            },
        }
    ]
});

const Product=mongoose.model("Product",ProductSchema);
module.exports=Product;