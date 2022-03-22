const express = require('express');
    morgan = require('morgan');
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

let users = [
    {
        id: 1,
        name: 'Kim',
        favouriteMovies: [],
    },
    {
        id: 2,
        name: 'Joe',
        favouriteMovies: [],
    }
]

let movies = [
    {
        title: 'Inglourious Basterds',
        description: 'In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner\'s vengeful plans for the same.',
        genre: {
            name: 'Drama',
            description: 'In film and television, drama is a category of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.',
        },
        director: {
            name: 'Quentin Tarantino',
            bio: 'Quentin Jerome Tarantino (born March 27, 1963) is an American filmmaker, actor, film critic and author. His films are characterized by nonlinear storylines, dark humor, stylized violence, extended dialogue, pervasive use of profanity, ensemble casts, references to popular culture, alternate history, and neo-noir.',
        },
        imageUrl: 'https://www.imdb.com/title/tt0361748/mediaviewer/rm3163035648/'
    },
    {
        title: 'Call Me by Your Name',
        description: 'In 1980s Italy, romance blossoms between a seventeen-year-old student and the older man hired as his father\'s research assistant.',
        genre: {
            name: 'Romance',
            description: 'Romance films or romance movies are romantic love stories recorded in visual media for broadcast in theaters and on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters and the journey that their love takes them through dating, courtship or marriage.',
        },
        director: {
            name:'Luca Guadagnino',
            bio: 'Luca Guadagnino (born 10th August 1971) is an Italian film director, producer, and screenwriter. He has collaborated a number of times with actress Tilda Swinton, including on the films The Protagonists (1999), I Am Love (2009), A Bigger Splash (2015) and Suspiria (2018), a remake of the 1977 film of the same name.',
        },
        imageUrl: 'https://www.imdb.com/title/tt5726616/mediaviewer/rm1422667008/?ref_=tt_ov_i'
    },
    {
        title: 'Into the Wild',
        description: 'After graduating from Emory University, top student and athlete Christopher McCandless abandons his possessions, gives his entire $24,000 savings account to charity and hitchhikes to Alaska to live in the wilderness. Along the way, Christopher encounters a series of characters that shape his life.',
        genre: {
            name: 'Drama',
            description: 'In film and television, drama is a category of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.',
        },
        director: {
            name: 'Sean Penn',
            bio: 'Sean Justin Penn (born August 17, 1960) is an American actor, director, screenwriter, and producer. He has won two Academy Awards, for his roles in the mystery drama Mystic River (2003) and the biopic Milk (2008).',
        },
        imageUrl: 'https://www.imdb.com/title/tt0758758/mediaviewer/rm2115475456/?ref_=tt_ov_i' 
    },
    {
        title: 'Lost in Translation',
        description: 'A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.',
        genre: {
            name: 'Drama',
            description: 'In film and television, drama is a category of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.',
        },
        director: {
            name: 'Sofia Coppola',
            bio: 'Sofia Carmina Coppola (born May 14, 1971) is an American filmmaker and actress.' 
        },
        imageUrl: 'https://www.imdb.com/title/tt0335266/mediaviewer/rm4226351616/?ref_=tt_ov_i'
    },
    {
        title: 'Babel',
        description: 'Tragedy strikes a married couple on vacation in the Moroccan desert, touching off an interlocking story involving four different families.',
        genre: 'Drama',
        director: {
            name: 'Alejandro G. Iñárritu',
            bio: 'Alejandro González Iñárritu, (born 15 August 1963) is a Mexican film director, producer and screenwriter. He is primarily known for making modern psychological drama films about the human condition.',
        },
        imageUrl: 'https://www.imdb.com/title/tt0449467/mediaviewer/rm1692291584/?ref_=tt_ov_i'
    }
];

//logging with Morgan
app.use(morgan('common'));

//get all static files from public dir
app.use(express.static('public'));

app.use(bodyParser.json());

//Resquests
// app.METHOD(PATH, HANDLER)

app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

//READ - Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//READ - Return data about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
    const { title } = req.params; //Object destructuring. Same as: const title = req.params.title;
    const movie = movies.find( movie => movie.title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('movie does not exist');
    }
});

//READ - Return data about a genre by name/title
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.genre.name === genreName ).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('genre does not exist');
    }
});

//READ - Return data about a director by name
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.director.name === directorName ).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('director does not exist');
    }
});

//CREATE - Allow new users to register
app.post('/users', (req, res) => {
    const newUser = req.body;

    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('user need name');
    }
});

//UPDATE - Allow users to update their user info (username)
app.put('/users/:id', (req, res) => {
    const { id } = req.params; //captures what was written in the URL
    const updatedUser = req.body; //captures new user name the client wrote

    let user = users.find( user => user.id == id); //take the right user from the array
    
    if (user) {
        user.name = updatedUser.name //subsitute the old name for the new name
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user');
    }
});

//CREATE - Allow users to add a movie to their list of favorites
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; //captures what was written in the URL

    let user = users.find( user => user.id == id); //take the right user from the array
    
    if (user) {
        user.favouriteMovies.push(movieTitle); //add movieTitle into the user/'s object --> favoutiteMovies
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user');
    }
});

//DELETE - Allow users to remove a movie from their list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; //captures what was written in the URL

    let user = users.find( user => user.id == id); //take the right user from the array
    
    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle); //remove movieTitle from user/'s object --> favoutiteMovies
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('no such user');
    }
});

//DELETE - Allow existing users to deregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params; 

    let user = users.find( user => user.id == id);
    
    if (user) {
        users = users.filter( user => user.id != id); //remove user
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user');
    }
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