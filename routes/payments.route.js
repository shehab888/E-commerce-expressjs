const express=require('express');
const paymentController=require('../controllers/payments.controller.js');
const router=express.Router();

router.post('/',paymentController.createPaymentIntent);

router.get('/',paymentController.getAllPayments);

router.get('/:id',paymentController.getPaymentById);


module.exports=router;

