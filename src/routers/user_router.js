const express = require('express');
const bcrypt = require('bcryptjs');
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

    const user = new User(req.body); //when call User(data), it goes to schema, where it is encrypted and arrives here
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
        //this lines causes middleware to run and update
        const user = await User.findById(req.params.id);
        updates.forEach((update) => user[update] = req.body[update]); //user.update is stataic, user[update] is dynamic
        await user.save(); //because this will fire middleware by updated value, for now it hashes the password

        // const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true}); //it does direct modfication on database which will not use middleware
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