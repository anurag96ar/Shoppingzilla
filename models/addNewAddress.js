const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  email:{  type: String,
    required: true}
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
