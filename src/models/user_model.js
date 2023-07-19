const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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

//middleware
//pre is doing before user is 'save', post is doing something after user is 'save;
userSchema.pre('save', async function(next){
    const user = this; //this is user to be saved
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next(); //indicates function is over , and proceed next call, if not called user will not be created and code remains here always
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;