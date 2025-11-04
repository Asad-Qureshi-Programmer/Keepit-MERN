const mongoose = require('mongoose')

//in production, db connected using func, then this func is imported in server.js, and then called in server.js

//in production, uri of databse is not exposed (it is secret),
// Every secret of backend kept in ----  .env   ------ file, in a variable and 
// then we need to download npm package "dotenv" to access that variable, import dotenv in server.js, then run "dotenv.config()" there
// using "process.env.varName"

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected To DB");
    })
}

module.exports = connectToDB


