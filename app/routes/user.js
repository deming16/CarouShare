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
router.get('/:username', (req, res, next) => {
    db.query('SELECT * FROM Users WHERE uid = $1::text', [req.params.username])
        .then(result => {
            if (result.rows.length === 0) {
                res.send('user does not exist');
            } else {
                res.render('user', { user: result.rows[0] });
            }

        });
});

// @route   POST /user/:username
// @desc    Update user
// @access  Private
router.post('/:username', (req, res, next) => {
    res.send(`update ${req.params.username}`);
});

// @route   POST /user/:username/delete
// @desc    Delete user
// @access  Private
router.post('/:username/delete', (req, res, next) => {
    res.send(`delete ${req.params.username}`);
});

// @route   POST /user/:username/like
// @desc    Add likes for user
// @access  Private
router.post('/:username/like', (req, res, next) => {
    res.send(`Add like for ${req.params.username}`);
});

// @route   POST /user/:username/like/delete
// @desc    Delete likes for user
// @access  Private
router.post('/:username/like/delete', (req, res, next) => {
    res.send(`Delete like for ${req.params.username}`);
});

module.exports = router;