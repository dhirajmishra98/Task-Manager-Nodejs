const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
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
        await req.user.remove();
        res.send({user: req.user, msg:"user removed from database"});
    }catch(e){
        res.status(500).send({error : e.message});
    }
})

//configure multer with file configuration etc
const upload = multer({
    // dest: 'avatar/', //this property will save data in local filesystem, without this we will specify to save in database in cloud
    limits: {
        fileSize: 1000000, //filesize in bytes, it is 1mb, files greater than 1mb willbe rejected
    },
    fileFilter (req, file, cb) {
        //we can add logic for type of files this way or use regex
        // if(!file.originalname.endsWith('.jpg')){
        //     return cb(new Error('file upload failed!'));
        // }

        //using regex from regex101.com website
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload image'));
        }
        cb(undefined, true);
    }
})

//upload user own avatar
userRouter.post('/users/me/avatar',authMiddleware, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({height: 250, width:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send({msg: "Avatar upload success"});
},(error, req, res, next)=>{
    //this section handles error occured with multer
    res.status(400).send({error: error.message});
})

//delete user own avatar
userRouter.delete('/users/me/avatar', authMiddleware, async (req, res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send({msg: "Avatar deleted success"});
})

userRouter.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error("No avatar found!");
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(404).send({error: e.message});
    }
})

module.exports = userRouter;