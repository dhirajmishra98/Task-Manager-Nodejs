const express = require('express');
const User = require('../models/user_model');

const userRouter = new express.Router();


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

    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);  
    } catch (e) {
        res.status(400).send({error: e.message});
    }

});


//get all users
userRouter.get('/users', async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(500).send({error: e.message});   
    }
})

//get particular user by id
userRouter.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try{
        const user = await User.findById(_id);
        if(!user) res.status(404).send({msg: "User not found!"});
        res.send(user);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

//update user with id of user
userRouter.patch('/users/:id', async (req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['email', 'name', 'password', 'age'];
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update));
    if(!isValidUpdate){
        return res.status(400).send({error : "Invalid update"});
    }

    const _id = req.params.id;
    try{
        const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});
        if(!user) res.status(404).send({msg: "User not found"});
        res.send(user);
    }catch(e){
        res.status(400).send({error: e.message});
    } 
})

//delete particular user with id
userRouter.delete('/users/:id', async (req, res)=>{
    const _id = req.params.id;
    try{
        const user = await User.findByIdAndDelete({ _id });
        if(!user) return res.status(404).send({msg : "User not found!"});
        res.send(user);
    }catch(e){
        res.status(500).send({error : e.message});
    }
})

module.exports = userRouter;