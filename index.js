
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5555;
const helmet = require('helmet');
const session = require('express-session');
const sessionMiddleware = require('./middlewares/sessionMiddleware');

// Adding helmet middleware
// app.use(helmet());

// Handlebars
const engineHandleBars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');

// Static folder
app.use(express.static(__dirname + '/securityPuplic'));

// Define Handlebars engine
const hbs = engineHandleBars.create({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    helpers: {
        raw: function(options) {
            return options.fn(this);
        }
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

//
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(sessionMiddleware);

// Routes
app.use('/', require('./routes/indexRouter'));
app.use('/single', require('./routes/commentsRouter'));
app.use('/users', require('./routes/userRouter'));

// Error handling
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send('Internal server error');
});

// Start web server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
