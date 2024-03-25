const Reservation = require('../models/Reservation');
const Restaurant  = require('../models/Restaurant');
const Menu  = require('../models/Menu');

exports.getReservations=async (req,res,next)=>{
    let query;
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path:'restaurant',
            select:'name province tel'
        });}else{
        query = Reservation.find().populate({
            path:"restaurant",
            select:'name tel'
        });}
    try{
        const reservations = await query;
        res.status(200).json({
            success: true,
            count:reservations.length,
            data:reservations
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot find Reservation'
        });
    }
};

exports.getReservation=async (req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path:'restaurant',
            select:'name province tel'
        }).populate({
            path: 'foodOrder', 
            model: 'Menu',
            select: 'price' 
          });
        if(!reservation){
            return res.status(404).json({success:false,massage:`No reservation with the id of ${req.parms.id}`});
        }
        let totalPrice = 0;
        reservation.foodOrder.forEach(menuItem => {
          totalPrice += menuItem.price;
        });
        res.status(200).json({
          success: true,
          data: reservation,
          totalPrice: totalPrice
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot find Reservation'
        });
    }
};

exports.addReservation=async (req,res,next)=>{
    try{
        req.body.restaurant = req.params.restaurantId;
        req.body.id = req.user.id;
        const existedReservation = await Reservation.find({user:req.user.id});
        if(existedReservation.length>=3&&req.user.role!=='admin'){
            return res.status(400).json({
                success:false,
                massage:`The user with the id ${req.user.id} has already made 3 reservation`
            });
        }
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if(!restaurant){
            return res.status(404).json({success:false,massage:`No restaurant with the id of ${req.parms.restaurantId}`});
        }

        //Check in open-close range
        const { apptDate } = req.body;
        const { open, close } = restaurant.openingHours;
        const apptdate = apptDate.slice(11,16);
        const openTime = parseInt(open.slice(0,2))*60 + parseInt(open.slice(3,5));
        let closeTime = parseInt(close.slice(0,2))*60 + parseInt(close.slice(3,5));
        let apptTime = parseInt(apptdate.slice(0,2))*60 + parseInt(apptdate.slice(3,5));

        if(closeTime < openTime) {
            closeTime += 1440;
            if(apptTime < closeTime && apptTime< openTime) {
                apptTime += 1440;
            }   
        }
        if(apptTime >= closeTime || apptTime < openTime) {
            return res.status(400).json({
                success: false,
                message: 'Reservation must be within restaurant opening hours'
            });
        }
        if(apptTime > closeTime-60) {
            return res.status(400).json({
                success: false,
                message: 'Reservation must be befor restaurant close time 1 hour'
            });
        }
        const reservation = (await Reservation.create(req.body));
        res.status(201).json({
            success: true,
            data:reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot Create Reservation'
        });
    }
};

exports.updateReservation=async (req,res,next)=>{
    try{
        
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,massage:`No reservation with the id of ${req.params.id}`});
        }
        if(reservation.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({
                success:false,
                massage:`User ${req.user.id} is not authorize to update this bootcamp`
            });
        }

        //Check in open-close range
        const { apptDate } = req.body;
        if(apptDate) {
            const restaurant = await Restaurant.findById(reservation.restaurant);
            const { open, close } = restaurant.openingHours;
            const apptdate = apptDate.slice(11,16);
            const openTime = parseInt(open.slice(0,2))*60 + parseInt(open.slice(3,5));
            let closeTime = parseInt(close.slice(0,2))*60 + parseInt(close.slice(3,5));
            let apptTime = parseInt(apptdate.slice(0,2))*60 + parseInt(apptdate.slice(3,5));
            if(closeTime < openTime) {
                closeTime += 1440;
                if(apptTime < closeTime && apptTime< openTime) {
                    apptTime += 1440;
                }   
            }
            if(apptTime >= closeTime || apptTime < openTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Reservation must be within restaurant opening hours'
                });
            }
            if(apptTime > closeTime - 60) {
                return res.status(400).json({
                    success: false,
                    message: 'Reservation must be befor restaurant close time 1 hour'
                });
            }
        }
        
        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            success: true,
            data:reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot update Reservation'
        });
    }
};

exports.deleteReservation=async (req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,massage:`No reservation with the id of ${req.params.id}`});
        }
        if(reservation.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({
                success:false,
                massage:`User ${req.user.id} is not authorize to delete this bootcamp`
            });
        }
        await reservation.deleteOne();
        res.status(200).json({
            success: true,
            data:{}
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot delete Reservation'
        });
    }
};

exports.orderFood =async (req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(400).json({
                success:false,
                massage:`Cannot find reservation with id of ${req.params.id}`
            });
        }
        if(reservation.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({
                success:false,
                massage:`User ${req.user.id} is not authorize to delete this bootcamp`
            });
        }
        if(reservation.foodOrder.length>=10&&req.user.role!=='admin'){
            return res.status(400).json({
                success:false,
                massage:`User with the id ${req.user.id} has already order more than 10 item`
            });
        }
        const item = await Menu.findById(req.body.id);
        if(!item){
            return res.status(404).json({success:false,massage:`There are no such item on menu`});
        }
        if(!item.restaurant.equals(reservation.restaurant)){
            return res.status(404).json({success:false,massage:`Your reserved restaurant does not have the current item`});
        }
        reservation.addItem(item);
        res.status(200).json({
            success: true,
            data:reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot Order Food'
        });
    }
};

exports.removeFood=async (req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,massage:`No reservation with the id of ${req.params.id}`});
        }
        if(reservation.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({
                success:false,
                massage:`User ${req.user.id} is not authorize to delete this bootcamp`
            });
        }
        reservation.removeItem(req.params.food);
        res.status(200).json({
            success: true,
            data:reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            massage:'Cannot delete Food order'
        });
    }
};