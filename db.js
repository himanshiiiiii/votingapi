const mongoose=require('mongoose');

require('dotenv').config();

//definf mongoDbURL
const mongoDbUrl=process.env.MONGODB_URL;

mongoose.connect(mongoDbUrl)
.then(()=>console.log("Connected sucessfully"))
.catch((err)=>console.log('Could not connect',err.message));

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

// Export the database connection
module.exports = db;