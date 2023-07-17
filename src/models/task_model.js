const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    description:{
        type: String,
        trim: true,
        required: true,
    },
    isDone:{
        type: Boolean,
        default: false,
    }
})

const taskModel = mongoose.model("Task", taskSchema);
module.exports = taskModel;