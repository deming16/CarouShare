const createError = require('http-errors');
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');

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
passport.deserializeUser(async (username, done) => {
    try {
        const output = await db.query(
            'SELECT COUNT(adm.uid) AS is_admin FROM Accounts acc LEFT JOIN Admins adm ON acc.uid = adm.uid WHERE acc.uid = $1::text',
            [username]
        );
        if (output.rows.length <= 0) ERRORS.userNotFound();

        const { is_admin } = output.rows[0];
        const isAdmin = Boolean(parseInt(is_admin, 10));
        done(null, {
            username: username,
            isAdmin: isAdmin
        });
    } catch (e) {
        done(e);
    }
});

// Other middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(flash());

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
    const auth = {};
    res.locals.auth = auth;
    if (req.isAuthenticated()) {
        auth.user = req.user;
    }
    res.locals.messages = req.flash('messages').join('<br>');
    next();
});

// Routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const itemRouter = require('./routes/item');
const dashboardRouter = require('./routes/dashboard');
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/item', itemRouter);
app.use('/dashboard', dashboardRouter);

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
