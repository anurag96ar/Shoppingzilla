const mongoose = require('mongoose');

const addtocartSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
      
    },
    product_id:{
        type:String,
        required:true,
        unique:true,
    },
    quantity:{
  type:Number,
  default:1
    }
})

const addToCart = mongoose.model('carts', addtocartSchema)

module.exports = addToCart;