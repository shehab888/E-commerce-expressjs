const express=require("express");
const authController=require('../controllers/auth.controller.js');

const router=express.Router();

router.post('/signup',authController.signup);
router.post('/signin',authController.signin);
router.post('/signout',authController.signout);

module.exports=router;