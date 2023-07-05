const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
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

const Banner = mongoose.model('banner', bannerSchema);

module.exports = Banner;
