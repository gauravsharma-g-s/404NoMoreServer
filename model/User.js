const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 4,
        max: 30
    },
    lastName: {
        type: String,
        required: true,
        min: 4,
        max: 30
    },
    email: {
        type: String,
        required: true,
        min: 2,
        max: 30,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 5
    },
    about:{
        type:String,
        max:50,
        default:""
    },
    skills:{
        type:String,
        max:50,
        default:""
    }

}, 
{
    timestamps: true
})

const User = mongoose.model("User", UserSchema)
module.exports = User;