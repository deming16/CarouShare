const createError = require('http-errors');
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// View engine setup
hbs.registerPartials(__dirname + '/views/partials');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Other middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Homepage and account routes
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/account/login');
const signupRouter = require('./routes/account/signup');
app.use('/', indexRouter);
app.use('/account/login', loginRouter);
app.use('/account/signup', signupRouter);

// Profile routes
const usersRouter = require('./routes/profile/index');
const followsRouter = require('./routes/profile/follows');
const likesRouter = require('./routes/profile/likes');
app.use('/profile/follows', followsRouter);
app.use('/profile/likes', likesRouter);
app.use('/profile', usersRouter);

// User dashboard and contents routes
const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);


// items routes
const itemsRouter = require('./routes/items');
app.use('/items', itemsRouter);


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
