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
});

// @route   GET users/:user
// @desc    Get info on one user
// @access  Public
router.get('/:user', function (req, res, next) {
    res.send(`Retrieving user ${req.params.user}`);
});

module.exports = router;
