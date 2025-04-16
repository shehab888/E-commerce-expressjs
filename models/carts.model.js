const mongoose = require('mongoose');

const carts=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true,"user is required"],
    },
    products:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required:[true,"product is required"],
            trim:true,
        },
        quantity:{
            type: Number,
            required: [true,"quantity is required"],
            min:[1,"quantity should be at least 1"],
            default: 1
        },
        status:{
            type: String,
            enum:['processed','unprocessed'],
            default:'unprocessed'
        },
        price: { 
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
    }],
})
const Cart=mongoose.model('Cart',carts);

module.exports=Cart;