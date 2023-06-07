const mongoose = require('mongoose');

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

const Product = mongoose.model('product_list', productSchema);

module.exports = Product;
