const express = require('express');
    morgan = require('morgan');

const app = express();


let topMovies = [
    {
        title: 'Inglourious Basterds',
        director: 'Quentin Tarantino',
    },
    {
        title: 'Call Me by Your Name',
        director: 'Luca Guadagnino',
    },
    {
        title: 'Into the Wild',
        director: 'Sean Penn',
    },
    {
        title: 'Lost in Translation',
        director: 'Sofia Coppola',
    },
    {
        title: 'Babel',
        director: 'Alejandro G. Iñárritu',
    },
    {
        title: 'Parasite',
        director: 'Bong Joon Ho',
    },
    {
        title: 'The Power of the Dog',
        director: 'Jane Campion',
    },
    {
        title: 'Fight Club',
        director: 'David Fincher',
    },
    {
        title: 'The Bucket List',
        director: 'Rob Reiner',
    },
    {
        title: 'The Lives of Others',
        director: 'Florian Henckel von Donnersmarck',
    }
];

//logging with Morgan
app.use(morgan('common'));

//get all static files from public dir
app.use(express.static('public'));

//Get Resquests
// app.METHOD(PATH, HANDLER)
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

//Handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//listen for requests
app.listen(8080, () => {
    console.log('Your App is listening on port 8080.');
});