const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orders.model');
const User = require('../models/users.model');
const Payment = require('../models/payments.model');
const STATUS = require('../middlewares/status.middleware');
const Product = require('../models/products.model');

async function createPaymentIntent(req, res) {
    try {
        let totalAmount = 0;

        // Get all orders that are in the "created" state for this user
        const orders = await Order.find({ userId: req.user._id, status: "created" });

        // Calculate the total amount
        orders.forEach(order => totalAmount += order.total);

        // Map the order IDs to send in the metadata
        const orderIds = orders.map(order => order._id.toString());

        // Create a Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Amount in cents
            currency: "usd",
            metadata: {
                orders: JSON.stringify(orderIds)
            },
            payment_method_types: ['card'],
            description: "payment for e-commerce product"
        });

        if (!paymentIntent) {
            return res.status(500).send({
                status: STATUS.INTERNAL_SERVER_ERROR,
                message: "Failed to create payment intent"
            });
        }
        
        // delete the paid orders from the user orders
        await User.updateMany({_id:req.user._id},{$pull:{orders:{$in:orderIds}}});
        
        let productsToBeUpdated = [];
        
        // Gather all products from all orders
        for (const order of orders) {
            for (const product of order.products) {
                productsToBeUpdated.push({
                    "productId": product.productId,
                    "quantity": product.quantity
                });
            }
        }
        
        // Now update each product
        for (const p of productsToBeUpdated) {
            await Product.updateOne(
                { _id: p.productId },
                { $inc: { stock: parseInt(p.quantity) * -1 } }
            );
        }
        
        // Update the status of the orders to "paid"
        await Order.updateMany(
            { userId: req.user._id, status: "created" },
            { status: "paid" }
        );
        
        const payment = await new Payment({
            userId: req.user._id, // Fix typo from req.user_id to req.user._id
            amount: totalAmount,
            orderIds,
            paymentIntentId: paymentIntent.id,
            status: "paid",
        }).save();

        return res.status(201).send({
            status: STATUS.SUCCESS,
            clientSecret: paymentIntent.client_secret,
            data: payment
        });

    } catch (error) {
        return res.status(500).send({
            status: STATUS.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
}

async function getPaymentById(req, res) {
    try {
        const paymentId = req.params.id; // This is the paymentIntentId that you saved
        const payment = await Payment.findOne({ userId: req.user._id, paymentIntentId: paymentId });

        if (!payment) {
            return res.status(404).send({
                status: STATUS.ERROR,
                message: "Payment not found"
            });
        }

        res.status(200).send({
            status: STATUS.SUCCESS,
            data: payment
        });

    } catch (error) {
        return res.status(500).send({
            status: STATUS.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
}

async function getAllPayments(req,res){
    try{
    const payments=await Payment.find({userId:req.user._id});
    if(!payments)
        return res.status(404).send({status:STATUS.ERROR,message:"there is no payments found"});
    return res.status(200).send({status:STATUS.SUCCESS,data:payments});
    }catch(error){
        return res.status(500).send({
            status: STATUS.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
}

module.exports = {
    createPaymentIntent,
    getPaymentById,
    getAllPayments
};
