const Cart=require('../models/carts.model.js');
const User=require('../models/users.model.js');
const Product=require('../models/products.model.js');
const Order =require("../models/orders.model.js")
const STATUS=require('../middlewares/status.middleware.js');

async function getOrders(req,res){
    try{    
        const orders=await Order.find({userId:req.user._id});
        if(!orders)
            return res.status(404).send({status:STATUS.NOT_FOUND,message:"No orders found"});
        return res.status(200).send({status:STATUS.SUCCESS,data:orders});
    }catch(error){
        return res.status(500).send({status:STATUS.INTERNAL_SERVER_ERROR,message:error.message})
    }
}
async function getOneOrder(req,res){
    try{    
        const id=req.params.id;
        const order=await Order.findOne({_id:id,userId:req.user._id});
        // const user=await User.findOne({_id:req.user._id,orders:id});
        if(!order)
            return res.status(404).send({status:STATUS.NOT_FOUND,message:"No order found"});
        return res.status(200).send({status:STATUS.SUCCESS,data:order});
    }catch(error){
        return res.status(500).send({status:STATUS.INTERNAL_SERVER_ERROR,message:error.message})
    }
}
async function createOrder(req,res){
    try{    
        const {products,shippingAddresse}=req.body;
       
        const userCart=await Cart.findOne({userId:req.user._id});
        if(!userCart)
            return res.status(404).send({status:STATUS.ERROR,message:"no cart found to create order"});

        let newCartProducts=[];
        let newUserCart=[]; 
        let total=0;
        for(let product of products){
            const foundProduct=userCart.products.find((productCart)=>{
                return (product.productId.toString()==productCart.productId.toString()) && (product.quantity <=productCart.quantity) ;
            })
            if(!foundProduct)
                return res.status(400).send({status:STATUS.FAIL,message:"prodcuts have error data"});
            const newQuantity=foundProduct.quantity-product.quantity;
            if (newQuantity > 0) {
                const updatedProduct = {
                    ...foundProduct.toObject(),
                    quantity: newQuantity,
                };
                newCartProducts.push(updatedProduct);
                newUserCart.push({productId:updatedProduct.productId,quantity:newQuantity});
            }
            product.price=foundProduct.price;
            total+=(product.quantity*product.price); 
        };

        const order= await new Order({userId:req.user._id,products,total,shippingAddresse}).save();

        await Cart.updateOne({userId:req.user._id},{$set:{products:newCartProducts}});

        await User.updateOne(
            { _id: req.user._id },
            {
              $set: { cart: newUserCart },
              $push: { orders: order._id }
            }
          );

        return res.status(200).send({status:STATUS.SUCCESS,message:"Order created successfuly",data:order});

        //! when payment done(the order status change and the products affected too) 

    }catch(error){
        return res.status(500).send({status:STATUS.INTERNAL_SERVER_ERROR,message:error.message});
    }
}

//todo if the order is created return the current element in the order into the carts and the user carts (Done)
//todo if the order is paid return the money and return the affected products add the product again (Done)
async function cancelOrder(req, res) {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order || order.status === "cancelled")
            return res.status(404).send({ status: STATUS.ERROR, message: "No order found or already cancelled" });

        const user = await User.findOne({ _id: req.user._id, orders: orderId });
        if (!user)
            return res.status(403).send({ status: STATUS.FORBIDDEN, message: "It is forbidden" });

        if (order.status === "created") {
            const cart = await Cart.findOne({ userId: req.user._id });
            if (!cart)
                return res.status(404).send({ status: STATUS.ERROR, message: "Cart not found" });

            for (let p of order.products) {
                const existing = cart.products.find(prod => prod.productId.toString() === p.productId.toString());

                if (existing) {
                    existing.quantity += p.quantity;

                } else {
                    cart.products.push({
                        productId: p.productId,
                        quantity: p.quantity,
                        price: p.price,
                        status: "unprocessed"
                    });
                }

                let existingProductInUserCart=user.cart.find(item=>item.productId.toString()===p.productId.toString());

                if(existingProductInUserCart)
                    existingProductInUserCart.quantity+=p.quantity;
                else
                    user.cart.push({productId:p.productId,quantity:p.quantity});
            }

            await cart.save();
            await user.save();

            order.status = "cancelled";
            await order.save();

            await User.updateOne({ _id: req.user._id }, { $pull: { orders: orderId } });

            return res.status(200).send({
                status: STATUS.SUCCESS,
                message: "The order cancelled and returned to cart successfully"
            });

        } else if (order.status === "paid") {
            for (let p of order.products) {
                await Product.updateOne(
                    { _id: p.productId },
                    { $inc: { stock: p.quantity } }
                );
            }

            order.status = "cancelled";
            await order.save();

            await User.updateOne({ _id: req.user._id }, { $pull: { orders: orderId } });
            await user.save();

            return res.status(200).send({
                status: STATUS.SUCCESS,
                message: "Paid order cancelled"
            });
        }

        return res.status(400).send({
            status: STATUS.FAIL,
            message: "Cannot cancel order in its current status"
        });

    } catch (error) {
        return res.status(500).send({
            status: STATUS.INTERNAL_SERVER_ERROR,
            message: error.message,
        });
    }
}

async function deleteOrderByAdmin(req, res) {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
      if (!order || order.status === "cancelled") {
        return res.status(404).send({ status: STATUS.ERROR, message: "Order not found or already cancelled" });
      }
  
      const user = await User.findOne({_id:order.userId});
      if (!user) {
        return res.status(404).send({ status: STATUS.ERROR, message: "User not found" });
      }
  
    if (order.status === "created") {
        const cart = await Cart.findOne({ userId: order.userId });
        if (!cart)
            return res.status(404).send({ status: STATUS.ERROR, message: "Cart not found" });

        for (let p of order.products) {
            const existing = cart.products.find(prod => prod.productId.toString() === p.productId.toString());

            if (existing) {
                existing.quantity += p.quantity;

            } else {
                cart.products.push({
                    productId: p.productId,
                    quantity: p.quantity,
                    price: p.price,
                });
            }

            let existingProductInUserCart=user.cart.find(item=>item.productId.toString()===p.productId.toString());

            if(existingProductInUserCart)
                existingProductInUserCart.quantity+=p.quantity;
            else
                user.cart.push({productId:p.productId,quantity:p.quantity});
        }

        await cart.save();
        await user.save();

        order.status = "cancelled";
        await order.save();

        await User.updateOne({ _id: order.userId }, { $pull: { orders: orderId } });

        return res.status(200).send({
            status: STATUS.SUCCESS,
            message: "The order cancelled and returned to cart successfully"
        });

    } 
    else if (order.status === "paid") {
        for (let p of order.products) {
          await Product.updateOne({ _id: p.productId }, { $inc: { stock: p.quantity } });
        }
      }
  
      order.status = "cancelled";
      await order.save();
  
      await User.updateOne({ _id: order.userId }, { $pull: { orders: orderId } });
      await user.save();
  
      return res.status(200).send({ status: STATUS.SUCCESS, message: "Order cancelled by admin" });
  
    } catch (error) {
      return res.status(500).send({ status: STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
  }
  

module.exports={
    getOneOrder,
    getOrders,
    createOrder,
    cancelOrder,
    deleteOrderByAdmin
}

