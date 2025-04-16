const express=require("express");
const ordersController=require("../controllers/orders.controller.js");
const isAdmin=require("../middlewares/isAdmin.middleware.js");
const router=express.Router();

router.get('/:id',ordersController.getOneOrder);

router.put('/:id',ordersController.cancelOrder);

router.delete('/:id',isAdmin,ordersController.deleteOrderByAdmin);//? protected method

router.get('/',ordersController.getOrders);

router.post('/',ordersController.createOrder);

module.exports=router;

