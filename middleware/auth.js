const jwt = require('jsonwebtoken');
const config = require('config');

// MW function is a function that has access to req, res and next is a clalback function we have to run so it moves
// on to the next piece of middleware
module.exports = function(req, res, next) {

    // Get token from header
    // the header key for the auth will be x-auth-token
    const token = req.header('x-auth-token');

    // check if no token
    if (!token) {

        // 401 is not authorized
        return res.status(401).json({"msg":"No token, authorization denied"});
    }

    // verify the token if ther is one
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // remember that the jwt payload has the user id
        // there is currently no req.user.  You have to set that so you can use it in later functions of private routes.
        // if your just tried to print it out here, nothing would happen.
        // but in the function that you're authorizing here, you WANT the user ID.
        req.user = decoded.user;

        // call the next function
        next();
    } catch(e) {

        // token is not valid
        res.status(401).json({"msg":"token is not valid"});

    }

}


