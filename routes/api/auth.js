const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { check, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// use our new middleware
const auth = require('../../middleware/auth');


// @route   GET api/auth
// @desc    test route
// access   Private
router.get('/', auth, async (req, res) => {

    try {

        // select -password means leave off the password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('server error');
    }

});

// @route   POST api/auth
// @desc    Authenticate user & get token. Login
// access   Public

router.post('/', [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').exists(),
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
    const { email, password} = req.body;
    try {
        // check if user exists
        let user = await User.findOne({   email: email  });
        if (! user) {
            return res.status(400).json({   errors:[ {msg: 'Invalid credentials'} ]   });
        }

        // match email and password once we find that the user exists 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({   errors:[ {msg: 'Invalid credentials'} ]   });
        }

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