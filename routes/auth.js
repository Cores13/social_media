const router = require('express').Router();
const User = require('../Models/User');
const bcrypt = require('bcrypt');

//REGISTER
router.post('/register', async (req, res)=>{
    try {
        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //Create new user
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        //Save user and return a response
        const user = await newUser.save();
        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(500);
    }
});

//LOGIN
router.get('/login', async (req, res) => {
    try{
        //Check email
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json('User not found');

        //Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json('Wrong password');

        res.status(200).json(user);
    }catch(error){
        console.log(error);
    }
})

module.exports = router;