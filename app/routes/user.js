var express = require('express');
var router = express.Router();

const passport = require('passport');
const { User } = require('../schemas/');
const db = require('../db');

// @route   GET /user
// @desc    Get current user
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const result = {};

            let query = 'SELECT uid, email, address, mobile FROM Users WHERE uid = $1';
            let values = [req.user.username];
            result.userDetails = await db.query(query, values);

            query = 'select iid, item_name, category, status, photo from Items where owner_uid = $1';
            result.items = await db.query(query, values);

            query = 'select iid, item_name, category, status, photo from UserLikeItems inner join Items on (item_iid = iid) where user_uid = $1';
            result.likes = await db.query(query, values);

            query = 'select follower_uid from Follows where followee_uid = $1';
            result.followers = await db.query(query, values);

            query = 'select followee_uid from Follows where follower_uid = $1';
            result.following = await db.query(query, values);

            res.render('user',
                {
                    user: result.userDetails.rows[0],
                    items: result.items.rows,
                    likes: result.likes.rows,
                    following: result.following.rows,
                    followers: result.followers.rows,
                    isMyProfile: true
                });

        } else {
            res.redirect('/login');
        }
    } catch (e) {

    }

});


// @route   GET /user/:username
// @desc    Get info on one user
// @access  Public
router.get('/:username', (req, res, next) => {
    const query = 'SELECT * FROM Users WHERE uid = $1';
    const values = [req.params.username];
    db.query(query, values)
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
    const query = "UPDATE Users " +
        "SET email = $1, address = $2, mobile = $3 " +
        "WHERE uid = $4";
    res.send(`update ${req.params.username}`);
});

// @route   POST /user/:username/delete
// @desc    Delete user
// @access  Private
router.post('/:username/delete', (req, res, next) => {
    const query = "DELETE FROM Users WHERE uid = $1";
    res.send(`delete ${req.params.username}`);
});

// @route   POST /user/:username/like
// @desc    Add likes for user
// @access  Private
router.post('/:username/like', (req, res, next) => {
    const query = "insert into UserLikeItems (user_uid, item_iid) values ($1, $2)";
    res.send(`Add like for ${req.params.username}`);
});

// @route   POST /user/:username/like/delete
// @desc    Delete likes for user
// @access  Private
router.post('/:username/like/delete', (req, res, next) => {
    const query = "delete from UserLikeItems where user_uid = $1"
    const values = [req.params.username];
    res.send(`Delete like for ${req.params.username}`);
});

module.exports = router;