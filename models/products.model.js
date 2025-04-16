const mongoose =require('mongoose');

const products=new mongoose.Schema({
    productName:{
        type:String,
        required:[true,"Product name is required"],
        trim:true,
        minlength:[3,"Product name must be at least 3 characters"],
        maxlength:[50,"Product name must be at most 50 characters"],
        index:true,
    },
    description:{
        type:String,
        required:[true,"Description is required"],
        minlength:[10,"Describtion must be at least 3 characters"],
        trim:true,
    },
    category:{
        type:String,
        required:[true,"Category is required"],
        index:true,
        trim:true,
        enum: ["Electronics", "Clothing", "Books"],
    },
    price:{
        type:Number,
        required:[true,"Price is required"],
        min:[0,"Price must be postive"],
        required:true
    },
    stock:{
        type:Number,
        required:[true,"Stock is required"],
        min:[0,"Stock can not be negative"],
        default:1,
    }, 
    imageUrl:{
        type:String,
        match: [/^https?:\/\/.+$/, 'Please enter a valid URL'],
    }
})

const Product=mongoose.model("Product",products);

module.exports=Product;