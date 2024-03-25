const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require :[true,'Not a number']
    },
    restaurant:{
        type:mongoose.Schema.ObjectId,
        ref:'Restaurant',
        require:true
    }
}
);

module.exports=mongoose.model('Menu',MenuSchema);