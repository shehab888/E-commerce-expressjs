const User=require('../models/users.model.js');
const Cart=require('../models/carts.model.js');
const Order=require('../models/orders.model.js');
const STATUS=require('../middlewares/status.middleware.js');
const bcryptjs=require('bcryptjs');

async function getProfile(req, res) {
    try{
        const user=await User.findById(req.user._id);
        if(!user)
            return res.status(404).send({success:STATUS.ERROR,message:'User not found'});;
        return res.status(200).send({success:STATUS.SUCCESS,data:user})
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}
async function updateProfile(req, res) {
    try{
        const payload=req.body;
        if(req.body.password){
            if(req.body.password.trim().length<8){
                return res.status(400).send({success:STATUS.ERROR,messege:"password should be at least 8 characters long"});
            }
           req.body.password= await bcryptjs.hash(payload.password,10);
        }
        if(req.body.role=="admin")
            return res.status(403).send({success:STATUS.FORBIDDEN,message:"You are forbidden to change the role"});
        const updatedProfile=await User.findByIdAndUpdate(req.user._id,payload,{new:true,runValidators:true});
        if(!updatedProfile)
            return res.status(404).send({success:STATUS.ERROR,message:'User not found'});
        return res.status(200).send({success:STATUS.SUCCESS,data:updatedProfile})
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}
async function deleteProfile(req, res) {
    try{
        await User.deleteOne({_id:req.user._id});
        await Cart.deleteOne({userId:req.user._id});
        await Order.updateMany({userId:req.user._id},{status:"cancelled"});
        res.clearCookie("jwtToken");
        return res.status(200).send({success:STATUS.SUCCESS,message:"User deleted successfully"})
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}

module.exports={
    getProfile,
    updateProfile,
    deleteProfile
}