const express=require('express');
const userController=require('../controllers/users.controller')

const router=express.Router();

router.get('/profile',userController.getProfile);
router.put('/profile',userController.updateProfile);
router.delete('/profile',userController.deleteProfile);

module.exports=router;