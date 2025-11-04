const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:[true, "username must be unique"],
        minlength: [3, "Username must be atleast 3 characters long"]
    },
    
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:[true, "email must be unique"],
        minlength: [13, "email must be atleast 13 characters long"]
    },

    password:{
        type:String,
        required:true,
        trim:true,
        minlength: [5, "Password must be atleast 5 characters long"]
    }
})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel