const express=require('express');

const cartController=require('../controllers/carts.controller.js');

const router=express.Router();

// router.get('/:id', cartController.getSpecificProductInCart);
router.put('/:id',cartController.updateSpecificProductInCart);
router.delete('/:id',cartController.deleteSpecificProductInCart);
router.post('/',cartController.addProductToCart);
router.get('/',cartController.getAllCart);
router.delete('/',cartController.deleteAllCart);

module.exports=router;