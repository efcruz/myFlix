const mongoose = require('mongoose'); //require the Mogoose Package
const Models = require('./models.js'); // require the file with models I created

const Movies = Models.Movie; //specify which models to use within the models.js file
const Users = Models.User;

const { check, validationResult } = require('express-validator');

mongoose.connect('mongodb://localhost:27017/myFlixDB',{ //allows Mongoose to connect with MongoDB so it can perform CRUD
    useNewUrlParser: true, useUnifiedTopology: true
});

const express = require('express');
const bodyParser = require('body-parser');
    morgan = require('morgan');
    uuid = require('uuid');

const app = express();

const cors = require('cors');
//set the application to allow requests from all origins:
app.use(cors());

//restrict origins:
/*let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins

            let message = 'The CORS policy for this application doesn\'t allow acess from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
const { castArray } = require('lodash');
require('./passport');

//logging with Morgan
app.use(morgan('common'));

//get all static files from public dir
app.use(express.static('public'));

//Resquests
// app.METHOD(PATH, HANDLER)

app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

//READ - Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error " + err);
        });
});

//READ - Return data about a single movie by title to the user
/*app.get('/movies/:title', (req, res) => {
    const { title } = req.params; //Object destructuring. Same as: const title = req.params.title;
    const movie = movies.find( movie => movie.title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('movie does not exist');
    }
});*/

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

//READ - Return data about a genre by name
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name }) //'Genre.Name' acess to the genre name to check matching with req
        .then((movie) => {
            res.status(200).json(movie.Genre); //movie.Genre acess to genre object (movie is the document name)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

//READ - Return data about a director by name
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then((movie) => {
            res.status(200).json(movie.Director)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

//READ - Return data about all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

///READ - Return data about user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//CREATE - Allow new users to register
app.post('/users', 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],(req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
   Users.findOne({ Username: req.body.Username }) //check if username already exists
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
                .create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) =>{res.status(201).json(user)
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                });
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

//UPDATE - Allow users to update their user info (username)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, //make sure taht the updadted document is returned
        (err, updatedUser) => {
            if(err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});
    
//UPDATE - Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $push:
        {
            FavoriteMovies: req.params.MovieID
        },
    },
    { new: true },
        (err, updateduser) => {
            if(err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updateduser);
            }
        });
});

//DELETE - Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $pull:
        {
            FavoriteMovies: req.params.MovieID
        },
    },
    { new: true },
        (err, deleteFavoriteMovie) => {
            if(err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(deleteFavoriteMovie);
            }
        });
});
    

//DELETE - Allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on port ' + port);
});