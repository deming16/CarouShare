const createError = require('http-errors');
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Other middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Homepage and validation routes
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);

// User dashboard and contents routes
const dashboardRouter = require('./routes/dashboard');
const followsRouter = require('./routes/follows');
const likesRouter = require('./routes/likes');
app.use('/dashboard', dashboardRouter);
app.use('/follows', followsRouter);
app.use('/likes', likesRouter);

// Browsing routes
const itemsRouter = require('./routes/items');
const usersRouter = require('./routes/users');
app.use('/items', itemsRouter);
app.use('/users', usersRouter);

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
