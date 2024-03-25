const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Plase add a name'],
        unique: true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 charector']
    },
    address:{
        district:{type:String,required: [true,'Please add an address']},
        province:{type:String,required: [true,'Please add an address']},
        postalcode:{type:String,required: [true,'Please add an address'],maxlength:5},
        region:{type:String,required: [true,'Please add an address']}
    },
    tel:{
        type:String,
        required: [true,'Please add an telephone number'],
        length:[10,'Name can not be more or less than 10 charector']
    },
    openingHours: {
        open: { type: String, required: true,match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/},
        close: { type: String, required: true,match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]||24:00$/}
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

RestaurantSchema.virtual('reservations',{
    ref:'Reservation',
    localField:'_id',
    foreignField:'restaurant',
    justOne:false
});

RestaurantSchema.virtual('menus',{
    ref:'Menu',
    localField:'_id',
    foreignField:'restaurant',
    justOne:false
});

RestaurantSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Reservation being remove form restaurant ${this._id}`);
    await this.model('Reservation').deleteMany({restrautant:this._id});
    next();
    console.log(`All menus being remove form restaurant ${this._id}`);
    await this.model('Menu').deleteMany({restrautant:this._id});
    next();
});


module.exports=mongoose.model('Restaurant',RestaurantSchema);