const bcryptjs=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/users.model.js');
const Cart=require('../models/carts.model.js');
const STATUS=require('../middlewares/status.middleware.js');

const signup=async function(req,res){
    try{
        const {username,email,password}=req.body;
        if(!password){
            return res.status(400).send({success:STATUS.ERROR,messege:"password is required"});
        }
        if(password.trim().length<8){
            return res.status(400).send({success:STATUS.ERROR,messege:"password should be at least 8 characters long"});
        }
        const hashedPassword=await bcryptjs.hash(password,10);
        const user=new User({
            username,
            email,
            password:hashedPassword,
        })
        await user.save();
        // await new Cart({userId:user.id,products:[]}).save();
        return res.status(201).send({success:STATUS.SUCCESS,message:"User created successfully"})
    }
    catch(error){
        return res.status(400).send({success:STATUS.ERROR,'message':error.message});
    }
}

const signin=async function(req,res){
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
             return res.status(404).send({success:STATUS.ERROR,message:"User email or password is incorrect"});
        }
        const isMatch=bcryptjs.compare(password,user.password);
        if(!isMatch){
            return res.status(404).send({success:STATUS.ERROR,message:"User email or password is incorrect"});
        }
        const jwtToken=jwt.sign({_id:user._id,email:user.email},process.env.JSON_WEB_TOKEN,{expiresIn:"10m"});
        res.cookie("jwtToken",jwtToken,{httpOnly:true},{});
        // console.log("===================",user.role);
        
        return res.status(200).send({success:STATUS.SUCCESS,message:"Usser login successfuly"});
    }catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:error.message});
    }
}

const signout=async function(req,res){
    try{
        res.clearCookie("jwtToken");
        return res.status(200).send({success:true,message:"User signed out successfully"})
    }
    catch(error){
        return res.status(500).send({success:STATUS.ERROR,message:"User signed out successfully"}); 
    }
}

module.exports={signup,signin,signout};