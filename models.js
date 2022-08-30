const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define schema for movies collection
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: String,
        Death: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

// Define schema for users collection
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Hashing of submitted passwords using bcrypt
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

// Validating submitted passwords
userSchema.methods.validatePassword = function(password) { //Don't use arrow functions when defining instance methods
    return bcrypt.compareSync(password, this.Password);
};

// Create models to use the defined schemas
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export the models to provide them for index.js
module.exports.Movie = Movie;
module.exports.User = User;

