const mongoose = require('mongoose');
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true,
    },
    email:{
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        validate:{
            validator: (val)=>{
                return validator.isEmail(val);
            },
            message: "Enter a valid email address",
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate:{
            validator : (val)=>{
                return !val.toLowerCase().includes('password');
            },
            message: 'password cannot contain "password".',
        }
    },
    age: {
        type: Number,
        default: 0,
        validate: {
            validator : (val)=>{
                return val>=0;
            },
            message: "Age must be positive number",
        }
    }
});

const userModel =new mongoose.model('User', userSchema);
module.exports = userModel;