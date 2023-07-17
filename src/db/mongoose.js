const mongoose = require('mongoose')
const userModel = require('../models/user_model');
const taskModel = require('../models/task_model')

const connectionUrl = 'mongodb://127.0.0.1:27017/task-manager-api'

mongoose.connect(connectionUrl, {useNewUrlParser: true, autoIndex: true});


// const user = new userModel({
//     name: "    Dhiraj mIhsra  ",
//     email: "Gobindmishra@gmail.com",
//     password: "1234"
// })

// user.save().then(()=>{
//     console.log("User ",user);
// }).catch((error)=>{
//     console.log("Error ",error);
// });

// const Task = mongoose.model("Task", taskSchema);

// const task = new taskModel({
//     description: "Learn Nodjs     ",
// });

// task.save().then(()=>{
//     console.log(task);
// }).catch((error)=>{
//     console.log(error);
// })

// const User = mongoose.model("User", userSchema);

// const user = new User({
//     name: "dhiraj msihra",
//     age: 22,
// });

// user.save().then(()=>{
//     console.log("User ",user);
// }).catch((error)=>{
//     console.log("Error ",error);
// });