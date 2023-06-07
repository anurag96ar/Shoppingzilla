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

const mongoose = require("mongoose");
const connectDB = () => {

  // Set up database connection
  mongoose.connect('mongodb+srv://anurameshar007:Anu96rag08@cluster1.jpjj33l.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('MongoDB Atlas connected')).catch(err => console.log(err));
};


module.exports = connectDB;

