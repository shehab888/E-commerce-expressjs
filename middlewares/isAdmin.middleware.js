const User=require('../models/users.model.js')

const isAdmin=async (req,res,next)=>{
    try{
    const user=await User.findById(req.user._id);
    if(req.user && user.role==='admin'){
        next();
    }else{
        return res.status(403).send({success:false,message:"Unauthorized to perform this action"});
    }
    }catch(error){
        return res.status(500).send({success:false,message:error.message});
    }
}

module.exports=isAdmin;