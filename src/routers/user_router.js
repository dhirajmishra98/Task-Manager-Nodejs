const express = require('express');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/auth_middleware');
const User = require('../models/user_model');

const userRouter = new express.Router();

// use of middleware will not exist in create,login, other will use middleware to get authenticated user or not

//create new user
userRouter.post('/users', async (req, res) => {

    /*
    Promise chaining without async await 
    const user = new User(req.body);
    user.save().then(() => {
        res.send(user);
    }).catch((error) => {
        res.status(400).send(error);
    });
    */

    const user = new User(req.body); //when call User(data), it goes to schema, where it is encrypted and arrives here
    try {
        await user.save();
        const token = await user.generateAuthTokens();
        res.status(201).send({user, token});  
    } catch (e) {
        res.status(400).send({error: e.message});
    }

});

//login user
userRouter.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password); //this func is in usermodel and accessed due to statics keyword used there
        const token = await user.generateAuthTokens();
        res.send({user, token});
    } catch(e){
        res.status(400).send({error: e.message});
    }
})

//logout user
userRouter.post('/users/logout', authMiddleware, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();

        res.status(200).send({msg: "logout Successful!"});
    } catch(e){
        res.status(500).send({error: e.message});
    }
})

//logout user from everywhere, delete all token
userRouter.post('/users/logoutAll', authMiddleware, async (req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();

        res.status(400).send({msg: "logged out from everywhere"});
    } catch(e){
        res.status(500).send({error: e.message});
    }
})


//get user profile only own profile
userRouter.get('/users/me', authMiddleware ,async (req, res) => {
    res.send(req.user); //if authmiddleware succed then only this will be called after middlware, its req has user from middlware
})


//update own user profile
userRouter.patch('/users/me',authMiddleware ,async (req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['email', 'name', 'password', 'age'];
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update));
    if(!isValidUpdate){
        return res.status(400).send({error : "Invalid update"});
    }

    try{
        //this lines causes middleware to run and update
        updates.forEach((update) => req.user[update] = req.body[update]); //user.update is stataic, user[update] is dynamic
        await req.user.save(); //because this will fire middleware by updated value, for now it hashes the password

        // const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true}); //it does direct modfication on database which will not use middleware
        res.send(req.user);
    }catch(e){
        res.status(400).send({error: e.message});
    } 
})

//delete own user id
userRouter.delete('/users/me', authMiddleware, async (req, res)=>{
    try{
        await req.user.deleteOne();
        res.send({user: req.user, msg:"user removed from database"});
    }catch(e){
        res.status(500).send({error : e.message});
    }
})

module.exports = userRouter;