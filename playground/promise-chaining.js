require('../src/db/mongoose');
const User = require('../src/models/user');


const userId = '64b2316f595ec569f8e053c3';

// User.findByIdAndUpdate(userId, {age:2}).then((user)=>{
//     console.log(user);
//     return User.countDocuments({age:2});
// }).then((result)=>{
//     console.log(result);
// }).catch((e)=>{
//     console.log(e);
// })


const updateAndCount = async (id,age)=>{
    const user =await User.findByIdAndUpdate(id, {age});
    const count = await User.countDocuments({age});

    return {user, count};
}

updateAndCount(userId, 87).then((result)=>{
    console.log("user ",result.user);
    console.log("count ", result.count);
    // console.log(result)
}).catch((err)=>{
    console.log("error ",err);
})
