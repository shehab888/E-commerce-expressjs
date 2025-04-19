const Cart=require('../models/carts.model.js');
const User=require('../models/users.model.js');
const Product=require('../models/products.model.js');
const STATUS=require('../middlewares/status.middleware.js');

// async function getSpecificProductInCart(req,res){
//     try{
//         const id=req.params.id;
//         const cartProduct=await Cart.findOne({userId:req.user._id,})

//     }catch(error){
//         return res.status(500).send({success:STATUS.ERROR,message:error.message});
//     }
// }
async function getAllCart(req,res){
    try{
       
        const cart=await Cart.findOne({userId:req.user._id});
        if(!cart){
            return res.status(404).send({success:STATUS.ERROR,message:"cart not found"});
        }
        return res.status(200).send({success:STATUS.SUCCESS,data:cart});

    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}
async function addProductToCart(req,res){
    try{
        const {productId,quantity}=req.body;


        //? check the product in the product already
        const productInProducts=await Product.findOne({_id:productId});
        if(!productInProducts){
            return res.status(404).send({success:STATUS.ERROR,message:"Product not found"});
        }else{
            if(quantity>productInProducts.stock)
                return res.status(400).send({success:STATUS.ERROR,message:"Insufficient stock"});
        }

        //? check if the product in the cart already
        let currentCart=await Cart.findOne({userId:req.user._id});
        if(!currentCart){
            const newCart=new Cart({userId:req.user._id});
            await newCart.save();
            currentCart=newCart;
        }
        const productIncart=currentCart.products.findIndex((c)=>{
            return c.productId.toString()==productId;
        });
        if(productIncart!==-1)
            return res.status(400).send({success:STATUS.ERROR,message:"product in cart "});

        //? update the cart
        // const updateCart=await Cart.findOneAndUpdate({userId:req.user._id},{$push:{products:req.body}},{new:true,runValidators:true});
        currentCart.products.push({productId,quantity,price:productInProducts.price});
        await currentCart.save();
        //? update the user cart too
        await User.updateOne({_id:req.user._id},{$push:{cart:{productId,quantity}}});
        return res.status(201).send({success:STATUS.SUCCESS,message:"Product added to cart successfully",data:currentCart});

    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}
async function updateSpecificProductInCart(req,res){
    try{
        const id =req.params.id;
        const {quantity}=req.body;
        const product =await Product.findById(id);
        // console.log("product",product.stock);
        
        if(quantity>product.stock)
            return res.status(400).send({success:STATUS.ERROR,message:"Insufficient stock"});
        const cart = await Cart.findOneAndUpdate(
            {userId: req.user._id, "products.productId": id }, 
            { $set: { "products.$.quantity": quantity }}, 
            { new: true, runValidators: true } 
        );
        if(!cart){
            return res.status(404).send({success:STATUS.ERROR,message:"cart not found"});
        }
        await User.updateOne(
            {_id: req.user._id, "cart.productId": id},
            {$set: {"cart.$.quantity": quantity}}
        );
        return res.status(200).send({success:STATUS.SUCCESS,message:"Product updated in cart successfully",data:cart});

    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}
async function deleteSpecificProductInCart(req,res){
    try{
        const id =req.params.id;
        const userHasTheProduct=await User.find({_id:req.user._id,"cart.products":{productId:id}});
        if(!userHasTheProduct)
            return res.status(403).send({status:STATUS.FORBIDDEN,message:"You can not delete product not found in the cart"});
        const cart=await Cart.findOneAndUpdate({userId:req.user._id},{$pull:{products:{productId:id}}},{new:true,runValidators:true});
        if(!cart){
            return res.status(404).send({success:STATUS.ERROR,message:"cart not found"});
        }
        //? update the user cart too (delte the product from the cart)
        await User.updateOne({_id:req.user._id},{$pull:{cart:{productId:id}}});
        return res.status(200).send({success:STATUS.SUCCESS,message:"Product deleted from cart successfully",data:cart});
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}
async function deleteAllCart(req,res){
    try{
        await Cart.deleteOne({userId:req.user._id});
        await User.updateOne({_id:req.user._id},{$set:{cart:[]}})  //? update the user cart too (delte all products from the cart)
        return res.status(200).send({success:STATUS.SUCCESS,message:"Cart deleted successfully"});
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}

module.exports={
    getAllCart,
    addProductToCart,
    updateSpecificProductInCart,
    deleteSpecificProductInCart,
    deleteAllCart,
 };
