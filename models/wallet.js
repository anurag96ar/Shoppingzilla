const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  spentAmount: {
    type: Number,
    default: 0
  }
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
