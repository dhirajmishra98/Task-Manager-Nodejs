require('../src/db/mongoose')
const Task = require('../src/models/task');

const taskId = '64b28b449283c8a23d229b88';

// Task.findByIdAndDelete(taskId).then((task)=>{
//     console.log(task);
//     return Task.countDocuments({isDone: false});
// }).then((result)=>{
//     console.log(result);
// }).catch((err)=>{
//     console.log(err);
// });

const deleteAndCount = async (id)=>{
    const task = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({isDone : false});

    return count;
}

deleteAndCount(taskId).then((result)=>{
    console.log(result);
}).catch((err)=>{
    console.log(err);
})