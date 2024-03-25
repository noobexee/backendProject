const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    apptDate:{
        type:Date,
        require:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        require :true
    },
    restaurant:{
        type:mongoose.Schema.ObjectId,
        ref:'Restaurant',
        require:true
    },
    foodOrder: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Menu'
      }],
    createdAt:{
        type:Date,
        default:Date.now
    }
});

ReservationSchema.methods.addItem = function(menuItemId) {
    this.foodOrder.push(menuItemId);
    return this.save();
};

ReservationSchema.methods.removeItem = function(menuItemId) {
    const index = this.foodOrder.indexOf(menuItemId);
    if (index !== -1) {
        this.foodOrder.splice(index, 1);
    }
    return this.save();
};


module.exports=mongoose.model('Reservation',ReservationSchema);