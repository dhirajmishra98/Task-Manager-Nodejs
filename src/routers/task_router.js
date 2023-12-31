const express = require('express');
const authMiddleware = require('../middlewares/auth_middleware');
const Task = require('../models/task_model');

const taskRouter = new express.Router();

//create new task
taskRouter.post('/tasks', authMiddleware ,async (req, res) => {
    const task = new Task({
        ...req.body, //it copies all the req body(description, complete) to new task object
        owner: req.user._id
    })
    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.send(400).send({error: e.message});
    }
})

//get all tasks of logged in user
//get filtering url = GET /tasks?completed=true or false
//get with pagination (limit and skip : limit means how many data to show in one page, skip means how many data to skip)
//url = GET /tasks?limit=10&skip=20, means 10data in one page, and skip 20data , means currently on 3rd page with 21-30s data
//sorting url = GET/tasks?sortBy=createdAt:desc
taskRouter.get('/tasks', authMiddleware,async (req, res) => {
    const match = {};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1]==='desc'?-1:1;
    }

    try{
        // first approach to return all task of logged in user
        // const tasks = await Task.find({ owner: req.user._id});
        // res.send(tasks);

        // //second approach
        await req.user.populate({
            path:'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

//get task by id of logged in user
taskRouter.get('/tasks/:id', authMiddleware,async (req, res) => {
    const _id = req.params.id;
    try{
        const task =await Task.findOne({ _id, owner: req.user._id});
        if(!task) res.status(404).send({msg: "Task not found"});
        res.send(task);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

//update task by id of logged in user
taskRouter.patch('/tasks/:id',authMiddleware,async (req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update));

    if(!isValidUpdate) return res.status(400).send({error: "Invalid Update!"});
    try{
        //to use middleware
        const task = await Task.findOne({ _id:req.params.id, owner:req.user._id });
        
        // const task = await Task.findByIdAndUpdate(_id, req.body, {new:true, runValidators:true});
        if(!task) return res.status(404).send({msg: "Task not found"});
        updates.forEach((update)=> task[update]=req.body[update]);
        await task.save();

        res.send(task);
    }catch(e){
        res.status(400).send({error: e.message});
    }
} )
 
//delete task by id and loggedin user
taskRouter.delete('/tasks/:id',authMiddleware, async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});
        if(!task) return res.status(404).send({error: "Task not found!"});
        res.send(task);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})


module.exports = taskRouter;