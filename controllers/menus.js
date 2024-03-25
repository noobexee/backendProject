const Reservation = require('../models/Reservation');
const Restaurant  = require('../models/Restaurant');
const Menu  = require('../models/Menu');

exports.getMenu = async (req,res,next)=>{
    try{
        const menu = await Menu.find({restaurant:req.params.id}).populate({
            path:'restaurant',
            select:'name'
        });
        if(!menu){
            return res.status(400).json({success:false,massage:`No restaurant with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            date:menu});
    }catch(err){
        res.status(400).json({success:false,massage:'Cannot find Menu'});
    }
};

exports.addMenu=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.body.restaurant);
        if(!restaurant){
            return res.status(404).json({success:false,massage:`No restaurant with the id of ${req.body.restaurant}`});
        }
        const menu = await Menu.create(req.body);
        res.status(200).json({
            success: true,
            data:menu
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot Create Menu'
        });
    }
};

exports.updateMenu = async (req,res,next)=>{
    try{
        const menu = await Menu.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidator:true
        });
        if(!menu){
            return res.status(400).json({success:false,massage:`No item with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:menu});
    }catch(err){
        res.status(400).json({success:false});
    }
};

exports.deleteMenu=async (req,res,next)=>{
    try{
        let menu = await Menu.findById(req.params.id);
        if(!menu){
            return res.status(404).json({success:false,massage:`No item with the id of ${req.params.id}`});
        }
        await menu.deleteOne();
        res.status(200).json({
            success: true,
            data:{}
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot delete this item'
        });
    }
};



