const mongoose = require('mongoose')

const connectionUrl = 'mongodb://127.0.0.1:27017/task-manager-api'

mongoose.connect(connectionUrl, { useNewUrlParser: true, autoIndex: true, dbName: "Task-Manger-Api"});


// Event listener for successful connection
mongoose.connection.on('connected', ()=>{
    console.log("Connected to MongoDb");
})

// Event listener for connection error
mongoose.connection.on('error', (err)=>{
    console.log("Error Occurred connecting to mongodb : ",err);
})

// Event listener for disconnected
mongoose.connection.on('disconnected', ()=>{
    console.log("Disconnected from mongoDB");
})

