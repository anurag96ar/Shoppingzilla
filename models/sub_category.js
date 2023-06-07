const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  subcategoryId: { type: String },
  data: [
    {
      id: { type: String },
      type: { type: String }
    }
  ]
},{collection:'subcategories'});

const categorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  subcategory: [subcategorySchema]
});

const SubCategory = mongoose.model('SubCategory', categorySchema);

module.exports = SubCategory;