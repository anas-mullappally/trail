const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  
  
   name:{

    type:String

   },
   createdAt: {
    type: Date,
    default: () => {
        const now = new Date();
        // Extract the date part
        const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return dateOnly;
    }
    },

    price :{
        type: Number
    },

    color:{
        type:Array
    },

    meterial :{
        type:String
    },
    coupon :{
        type:Array
    },

    mrp :{

        type:Number
    },

    description :{

        type:String
    },

    category : {

        type:String

    },
    modelNumber: {
        type: String
    },
    images: {
        type:Array
    },

});

 
const Product = mongoose.model('Product', productSchema);

module.exports = Product; // export the module