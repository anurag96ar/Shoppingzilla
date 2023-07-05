const mongoose = require('mongoose');

const yourSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const ReturnRequest = mongoose.model('returnRequest', yourSchema);

module.exports = ReturnRequest;
