const express = require('express');
const Task = require('../models/task_model');

const taskRouter = new express.Router();

//create new task
taskRouter.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.send(400).send({error: e.message});
    }
})

//get all tasks
taskRouter.get('/tasks',async (req, res) => {
    try{
        const tasks = await Task.find({});
        res.send(tasks);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

//get task by id
taskRouter.get('/tasks/:id',async (req, res) => {
    const _id = req.params.id;
    try{
        const task =await Task.findById(_id);
        if(!task) res.status(404).send({msg: "Task not found"});
        res.send(task);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

//update task by id
taskRouter.patch('/tasks/:id',async (req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update));

    if(!isValidUpdate) return res.status(400).send({error: "Invalid Update!"});
    const _id = req.params.id;
    try{
        //to use middleware
        const task = await Task.findById(req.params.id);
        updates.forEach((update)=> task[update]=req.body[update]);
        await task.save();

        // const task = await Task.findByIdAndUpdate(_id, req.body, {new:true, runValidators:true});
        if(!task) return res.status(404).send({msg: "Task not found"});

        res.send(task);
    }catch(e){
        res.status(400).send({error: e.message});
    }
} )
 
//delete task by id
taskRouter.delete('/tasks/:id', async (req,res)=>{
    const _id = req.params.id;
    try{
        const task = await Task.findByIdAndDelete({ _id });
        if(!task) return res.status(404).send({error: "Task not found!"});
        res.send(task);
    }catch(e){
        res.status(500).send({error: e.message});
    }
})


module.exports = taskRouter;