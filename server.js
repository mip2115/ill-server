const express = require('express');
const connectDb = require('./config/db');

const app = express();

// Connect to the db
connectDb();

// init middleware that recognizes incoming objects as JSON objects
// This is mainly for POST requests.
app.use(express.json({extended: false}));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/songs', require('./routes/api/songs'));
app.use('/api/auth', require('./routes/api/auth'));

// look for an env variable called port to use, 
// this is when you deploy.  But if there is not port env set,
// default to 5000.
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));