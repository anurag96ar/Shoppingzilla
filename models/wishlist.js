const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
      
    },
    product_id:{
        type:String,
        required:true,
        unique:true,
    },
})

const wishlist = mongoose.model('wishlist', wishlistSchema)

module.exports = wishlist   ;