const User=require('../models/users.model.js');
const Product=require('../models/products.model.js');
const Cart=require('../models/carts.model.js')
const Order=require('../models/orders.model.js')
const STATUS=require('../middlewares/status.middleware.js');

async function getProducts(req,res){
    try{
        let {minPrice,maxPrice,category,limit=2,page=1}=req.query;
        let query={};
        if(category)
            query.category=category;
        if(minPrice && maxPrice)
            query.price={$lte:Number(maxPrice),$gte:Number(minPrice)};
        limit=+limit;page=+page;
        const products=await Product.find(query).limit(parseInt(limit)).skip(parseInt(page - 1)*limit);
        return res.status(200).send({success:STATUS.SUCCESS,data:products});
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,messege:error.message});
    }
}

async function getProduct(req,res){
    try{
    const id=req.params.id;
    const product =await Product.findOne({_id:id});
    if(!product)
        return res.status(404).send({success:STATUS.ERROR,messege:"Product not found"})
    return res.status(200).send({success:STATUS.SUCCESS,data:product});
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,messege:error.message});
    }
} 

 //? (Admin function)
async function createProduct(req,res){
    try{
        const foundedUser=await User.findById(req.user._id);
        if(foundedUser.role !== "admin"){
            return res.status(401).send({success:STATUS.UNAUTHORIZED,message:"User is not authorized"});
        }
    const{productName,description,category,price,stock} = req.body;
    await new Product({
        productName,
        description,
        category,
        price,
        stock
        
    }).save();
    return res.status(201).send({success:STATUS.SUCCESS,message:"Product created successfully"});
    }catch(error){
        return res.status(500).send({success:STATUS.FAIL,message:error.message});
    }
}

async function updateProduct(req,res){
    try{
        //! update the product updated from the cart and usercart and orders that pinding
        const id=req.params.id;
        const updatedProduct=req.body;
        const product=await Product.findByIdAndUpdate(id,updatedProduct,{
            new:true, //? to return the new product after update not the old
            runValidators:true  //? to run the schema validation on the new product
        });
        if(!product)
            return res.status(404).send({success:STATUS.ERROR,message:"Product not found"});
        return res.status(200).send({success:STATUS.SUCCESS,message:"Product updated successfully",data:product});
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }

} //? (Admin function)
async function deleteProduct(req,res){
    //! delete the product deleted from the cart and usercart and orders and userOrder that created only 
    try{
    const id=req.params.id;
    //? update the user orders
    const orders=await Order.find({"products.productId":id,status:"created"});
    const ordersIds=orders.products.map(e=>e.productId);
    await User.updateMany({orders:{$in:ordersIds}},{$pull:{orders:{$in:ordersIds}}})
    //? update the cart
    await Cart.updateMany({"products.productId":id},{$pull:{products:{productId:id}}});
    //? update the  orders
    await Order.updateMany({"products.productId":id},{status:"cancelled"});
    //? update user cart
    await User.updateMany({"cart.productId":id},{$pull:{cart:{productId:id}}});
    //? delete the product
    await Product.deleteOne({_id:id});

    return res.status(200).send({success:STATUS.SUCCESS,message:"Product deleted successfully"})
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }

} //? (Admin function)

module.exports={
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}