const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  
  
   categorie :{
    type:String
   },

   
   createdAt :{
      type:Date,
      default:Date.now}

});

 
const Categorie = mongoose.model('Categorie', categorySchema);

module.exports = Categorie; // export the module