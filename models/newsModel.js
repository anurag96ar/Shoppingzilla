const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    
    newsEmail:{
        type:String,
        unique:true 
    },
   
})

const news = mongoose.model('news', newsSchema)

module.exports = news   ;