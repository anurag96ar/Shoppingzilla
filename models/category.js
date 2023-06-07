const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category: [
    {
      type: { type: String },
      id: { type: String }
    }
  ]
},{collection: 'category'});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;