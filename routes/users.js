const User = require('../Models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');

//Update user
router.put('/:id', async (req, res) => {
    if(req.body.userId == req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }catch(error){
                return res.status(500).json(error);
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {$set: req.body,});
            res.status(200).json('Account has been updated');
        }catch(error){
            res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You can update only your account!');
    }
});
//Delete user
router.delete('/:id', async (req, res) => {
    if(req.body.userId == req.params.id || req.body.isAdmin){
        try{
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json('Account has been deleted');
        }catch(error){
            res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You can delete only your account!');
    }
});

//Get a user
router.get('/', async(req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try{
        const user = userId ? await User.findById(userId) : await User.findOne({username});
        const {password, updatedAt, ...other} = user._doc;
        res.status(200).json(other);
    }catch(error){
        res.status(500).json(error);
    }
})

//Get following
router.get('/following/:userId', async (req, res) => {
    try{
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.following.map(friendId => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map(friend => {
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        });
        res.status(200).json(friendList);
    }catch(error){
        res.status(500).json(error);
    }
})
//Get followers
router.get('/followers/:userId', async (req, res) => {
    try{
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followers.map(friendId => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map(friend => {
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        });
        res.status(200).json(friendList);
    }catch(error){
        res.status(500).json(error);
    }
})

//Follow a user
router.put('/:id/follow', async (req, res) => {
    if(req.body.userId !== req.params.id){
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(!user.followers.includes(req.body.userId)){
            await user.updateOne({$push:{followers: req.body.userId}});
            await currentUser.updateOne({$push:{following: req.params.id}});
            res.status(200).json('User has been followed');
        }else{
            res.status(403).json('You already follow this user');
        }
    }else{
        res.status(403).json('You can\'t follow yourself');
    }
})
//Unfollow a user
router.put('/:id/unfollow', async (req, res) => {
    if(req.body.userId !== req.params.id){
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(user.followers.includes(req.body.userId)){
            await user.updateOne({$pull:{followers: req.body.userId}});
            await currentUser.updateOne({$pull:{following: req.params.id}});
            res.status(200).json('User has been unfollowed');
        }else{
            res.status(403).json('You already don\'t follow this user');
        }
    }else{
        res.status(403).json('You cannot unfollow yourself');
    }
})

module.exports = router;