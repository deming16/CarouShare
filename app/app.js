const createError = require('http-errors');
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Authentication
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('./db/');
const { ERRORS } = require('./utils/errors');

const app = express();

// View engine setup
hbs.registerPartials(__dirname + '/views/partials');
hbs.localsAsTemplateData(app);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.locals.config = {
    siteTitle: 'CarouShare'
};

// Authentications
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const output = await db.query('SELECT * FROM Accounts WHERE uid = $1::text', [username]);
            if (output.rows.length <= 0) ERRORS.invalidUsernameOrPassword();

            // Password check
            const user = output.rows[0];
            if (user.password !== password) ERRORS.invalidUsernameOrPassword();
            return done(null, user);
        } catch (e) {
            return done(e);
        }
    })
);
passport.serializeUser((user, done) => {
    done(null, user.uid);
});
passport.deserializeUser((username, done) => {
    done(null, { username: username });
});

// Other middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auth middlewares
app.use(
    session({
        store: new FileStore(),
        secret: 'cs2102',
        resave: false,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.auth = {
        user: req.user
    };
    res.locals.message = {
        body: req.query.message_body,
        type: req.query.message_type
    };
    next();
});

// Routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const itemRouter = require('./routes/item');
const reviewRouter = require('./routes/review');
const listingRouter = require('./routes/listing');
const searchRouter = require('./routes/search');
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/item', itemRouter);
app.use('/review', reviewRouter);
app.use('/listing', listingRouter);
app.use('/search', searchRouter);



// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
