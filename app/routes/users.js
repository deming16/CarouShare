var express = require('express');
var router = express.Router();

// @route   GET users/test
// @desc    Test users route
// @access  Public
router.get('/test', function (req, res, next) {
    res.send('respond with a resource');
});

// @route   GET users
// @desc    Get all users
// @access  Public
router.get('/', function (req, res, next) {
    res.send('Retrieving all users');
    // SELECT uid FROM Users;
});

// @route   GET users/:user
// @desc    Get info on one user
// @access  Public
router.get('/:user', function (req, res, next) {
    res.send(`Retrieving user ${req.params.user}`);
    // SELECT * FROM Users WHERE uid = ${req.params.user}
});

// @route   GET users/notifications/:user
// @desc    Get updates on info user subscribed to
// @access  Private
router.get('/notifications/:user', function (req, res, next) {
    res.send(`Update notification for user ${req.params.user}`);
});

// @route   POST user/add
// @desc    Add new user
// @access  Private
router.post('/users/add', function (req, res, next) {
    res.send(`User added`);
});

// @route   PUT users/update/:user
// @desc    Update user
// @access  Private
router.put('/users/update/:user', function (req, res, next) {
    res.send(`User ${req.params.user} updated`);
});

module.exports = router;
