const mongoose=require('mongoose');

const connectToDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("connection is established");
    }
    catch(e){
        console.log(`Error connecting to Mongo Database: ${e.message}`);
    }
}

module.exports = connectToDb;