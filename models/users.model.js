const mongoose = require('mongoose');

const users=new mongoose.Schema({
    username:{
        type: String,
        required: [true,"Usernmae is Required"],
        trim:true,
        minlength:[3,"the name at least contains 3 characters"],
        maxlength:[50,"the name at most contains 50 characters"],
    },
    email:{
        type:String,
        required: [true,"Email is Required"],
        trim:true,
        unique:[true,"Email is Unique"],
        lowercase:true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid Email Format"]
    },
    password:{
        type: String,
        required: [true,"password is Required"],
        // trim:true,
        // minlength:[8,"the password at least contains 8 characters"],
        // maxlength: [20, "The password cannot exceed 20 characters"]
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    cart:[{
        productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true,
        },
        quantity:{
            type:Number,
            required:true,
            min:[1,"Quantity should be at least 1"],
            default:1,
        }
    }],
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    }],
})
//? middleware handle the password before hashing and validation
// userSchema.pre('validate', function (next) {
//     if (!this.password) {
//         return next(new Error("Password is required"));
//     }

//     if (this.password.trim().length < 8) {
//         return next(new Error("Password should be at least 8 characters long"));
//     }

//     next(); 
// });
const User=mongoose.model('User',users);
module.exports=User;