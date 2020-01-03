const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
 
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');



// @route   GET api/Users
// @desc    test route
// access   Public

// in the brackets is the middleware functions from validator
router.get('/', (req, res) => res.send("Users route"));

// @route   POST api/Users
// @desc    Register User
// access   Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').not().isEmpty()
],
async (req, res) => { // this run asynchronosuly so it doesn't tie the whole server down

    // here is where you apply all the middleware functionality
    // in the brackets
    const errors = validationResult(req);

    // if there are errors (the errors object is not empty)
    // send back all the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    // Logic:
    // check if user exists
    // encrypt password with bcrypt
    // return jwt – logs user in right away

    // destruct to get all the crap you need out of the body
    const {name, email, password} = req.body;
    try {
        // check if user exists
        let user = await User.findOne({   email: email  });
        if (user) {
            return res.status(400).json({   errors:[ {msg: 'User already exists'} ]   });
        }

        // create the new user.  It's not saved yet.
        // You need to first encrypt the password.
        user = new User({
            name: name,
            email: email,
            password: password,
        });

        // does our hashing
        // higher number makes it more secure
        const salt = await bcrypt.genSalt(10);

        // perform the hash
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // we already got the id back after saving it.  Mongoose makes it so we don't have to do ._id
        // we just need the ID to authorize that user to access protected routes
        const payload = {
            user: {
                id: user.id,
            }
        }

        // now sign the jwt
        jwt.sign(
            payload, 
            config.get("jwtSecret"),
            {expiresIn: 30000000}, 
            (err, token) => {
                if (err) throw err;
                return res.json({token:token});
            }
        );


 


    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});





module.exports = router;