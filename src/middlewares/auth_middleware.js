require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const authMiddleware = async (req,res,next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ',''); //if token is null , replce will throw error to catch
        const isVerify = jwt.verify(token, process.env.jwtSecretKEY);
        const user =await User.findOne({_id: isVerify._id, 'tokens.token':token});

        if(!user){
            throw new Error(); //if no user exist in db with the token, throw error to catch
        }

        req.token = token;
        req.user = user; //send user in req header from where middleware is called
        next(); //to call next func
    }catch(e){
        res.status(401).send({error: `Authorization failed!, ${e.message}`}); //401 -> not authorized
    }
}

module.exports = authMiddleware;