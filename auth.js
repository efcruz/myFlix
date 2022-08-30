const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

/**
 * Creates a JWT token
 * @function generateJWTToken
 * @param {Object} user
 * @returns {Object} user
 */

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

//POST login
/**
 * User login function, jwt token generated
 * @function [path]/login
 * @param {any} router
 * @returns {Object} user
 * @requires passport
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false
        }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}