const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
 
  category: {
    type: String,
    required: true
  },
  sub_category: {
    type: String,
    required: true
  },
  product_sub_category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,

  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,

  },
  color: {
    type: [String],
    default: []
  },
  totalrating: {
    type: String,
    default: '0'
  },
  deleted: {
    type: String,
    default: false
  },
  images: [
    {
      image: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      }
    }
  ],
  ratings: {
    type: [Number],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: function (value) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const addressSchema = new Schema({
  receiverName: {
    type: String,
    required: true
  },
  completeAddress: {
    type: String,
    required: true
  },
  landMark: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});


const orderSchema = new Schema({
  address: addressSchema,
  paymentMode: String,
  cart: {
    email: String,
    products: [{
      data: productSchema,
      price: Number,
      quantity: Number,
      product_id: String
    }
    ],
    totalAmount: Number
  },
  placedDate: {
    type: Date,
    default: Date.now,
    get: function (value) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

  },
  shippedDate: {
    type: Date,
    get: function (value) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

  },
  OutDeliveryDate: {
    type: Date,
    get: function (value) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

  },
  CancelDate: {
    type: Date,
    get: function (value) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

  },
  DeliveredDate: {
    type: Date,
    get: function (value) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

  },
  paymentStatus: {
    type: String,
    default: "Order Placed"
  },
  email: {
    type: String,
    required: true
  },
  orderId:{
    type:String
  },
  paymentId:{
    type:String
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;