var express = require('express');
var router = express.Router();
const db = require('../../db');

// @route   GET /profile
// @desc    Get all users
// @access  Public
router.get('/', function (req, res, next) {
    db.query('SELECT uid FROM Users')
        .then(result => {
            res.render('profile/index', { users: result.rows });
        });
});

// @route   GET profile/:user
// @desc    Get info on one user
// @access  Public
router.get('/:user', function (req, res, next) {
    db.query('SELECT * FROM Users WHERE uid = $1::text', [req.params.user])
        .then(result => {
            if (result.rows.length === 0) {
                res.send('user does not exist');
            } else {
                res.render('profile/userProfile', { user: result.rows[0] });
            }

        });
});

module.exports = router;
