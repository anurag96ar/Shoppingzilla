const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
   
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  spent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
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
  
});

const WalletHistory = mongoose.model('WalletHistory', walletSchema);

module.exports = WalletHistory;