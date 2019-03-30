var express = require('express');
var router = express.Router();
const db = require('../../db');

// @route   GET profile/test
// @desc    Test profile route
// @access  Public
router.get('/test', function (req, res, next) {
    res.send('respond with a resource');
});

// @route   GET /profile
// @desc    Get all users
// @access  Public
router.get('/', function (req, res, next) {
    res.render('profile/index');
    // SELECT uid FROM Users;
});

// @route   GET profile/:user
// @desc    Get info on one user
// @access  Public
router.get('/:user', function (req, res, next) {
    db.query('SELECT * FROM Users WHERE uid = $1::text', [req.params.user])
        .then(result => {
            res.render('profile/userProfile', { user: result.rows[0] });
        });

});

module.exports = router;
