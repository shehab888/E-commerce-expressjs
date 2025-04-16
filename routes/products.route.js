const express=require('express');
const productController=require('../controllers/products.controller.js');
const isAdmin=require('../middlewares/isAdmin.middleware.js');
const router=express.Router();


//! comments about the important of the order of the router endpoints
// ?Your routes are defined in the wrong order (most specific routes should come first)
//? The ID-specific route might have an error that's causing it to fail silently, falling back to the general route
// ?You might have wildcard middleware that catches all requests to '/api/product/*

router.get('/:id',productController.getProduct);
router.put('/:id',isAdmin,productController.updateProduct); //? protected route
router.delete('/:id',isAdmin,productController.deleteProduct); //? protected route
router.get('/',productController.getProducts);
router.post('/',isAdmin,productController.createProduct); //? protected route


module.exports=router;
