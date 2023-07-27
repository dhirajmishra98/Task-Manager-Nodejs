require('dotenv').config();
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true,
    },
    email:{
        type: String,
        unique: true,
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
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
});

//methods can be used outside on instances (user) : like in user routes
userSchema.methods.generateAuthTokens = async function(){
    const user = this; //access the user instance from where it is called
    const token = jwt.sign({ _id:user._id.toString() }, process.env.jwtSecretKEY);

    user.tokens = user.tokens.concat({token}); //add tokens to array of object of token in user
    await user.save();
    return token;
}

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.tokens;
    delete userObject.password;

    return userObject;
}

//statics can be used outside on Models (userModel): like in userModel of this file
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await userModel.findOne({email});
    if(!user){
        throw new Error('Unable to login');
    } 

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }

    return user;
}

//middleware - hasing password before save to database
//hashing is irreversible : password->encrypted->password can't be got
//encrption is reversible : password->encryption->encrypted password->decryption->password
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