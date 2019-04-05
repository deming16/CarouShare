var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   GET /user
// @desc    Get current user
// @access  Private
router.get('/', (req, res, next) => {
    res.send('This page should give profile of current user');
});


// @route   GET /user/:username
// @desc    Get info on one user
// @access  Public
router.get('/:user', (req, res, next) => {
    db.query('SELECT * FROM Users WHERE uid = $1::text', [req.params.user])
        .then(result => {
            if (result.rows.length === 0) {
                res.send('user does not exist');
            } else {
                res.render('user', { user: result.rows[0] });
            }

        });
});

module.exports = router;
