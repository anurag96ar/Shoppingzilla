const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code:{
        type: String,
        required: true,
        unique: true
    },

    discount:{
        type:Number,
        required:true,
        min: 0,
        max: 100
    },
    amount:{
        type:Number,
        required:true,
        
    },

    expiryDate:{
        type:Date,
        required: true,
        default: Date.now,
        get: function (value) {
            return value.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true
            });
          }
        
    },

    status:{
        type:Boolean,
        default: true
    },
   
    usedBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

const Coupon = mongoose.model('Coupon', couponSchema)

module.exports = Coupon;
