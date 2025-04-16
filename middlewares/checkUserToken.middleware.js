const jwt=require('jsonwebtoken');
const STATUS=require('./status.middleware');
const User=require('../models/users.model.js')

async function checkUserToken(req,res,next){
    try{
    const jwtToken=req.cookies.jwtToken;
    if(!jwtToken){
        return res.status(401).send({success:STATUS.UNAUTHORIZED,message:"you are unauthorized"});
    }
    const payload=jwt.verify(jwtToken,process.env.JSON_WEB_TOKEN);
    const foundedUser=await User.findOne({_id: payload._id});
    if(!foundedUser){
        return res.status(401).send({success:STATUS.UNAUTHORIZED,message:"you are unauthorized"})
    }
    req.user=payload;
    req._id=payload._id;
    next();
    }catch(error){
        return res.status(401).send({success:STATUS.FAIL,message:error.message});
    }
}

module.exports=checkUserToken;