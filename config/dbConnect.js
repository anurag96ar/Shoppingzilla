// const {default: mongoose}=require("mongoose")

// const dbConnect=()=>{
//     try{
//     const conn=mongoose.connect(process.env.MONGODB_URL)
//     console.log("Database connected");
//     }
//     catch(error){
// console.log("Database error"); 
//     }
// }
// module.exports=dbConnect;
// password-Anu96rag08@
require('dotenv').config()
const mongoose = require("mongoose");
const connectDB = () => {

  // Set up database connection
  mongoose.connect(process.env.DATA_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('MongoDB Atlas connected')).catch(err => console.log(err));
};

module.exports = connectDB;

