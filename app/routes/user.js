var express = require('express');
var router = express.Router();

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

            query =
                'select iid, item_name, category, status, photo from UserLikeItems inner join Items on (item_iid = iid) where user_uid = $1';
            result.likes = await db.query(query, values);

            query = 'select follower_uid from Follows where followee_uid = $1';
            result.followers = await db.query(query, values);

            query = 'select followee_uid from Follows where follower_uid = $1';
            result.following = await db.query(query, values);

            query =
                'select lid, item_iid, title, Listings.status as status, delivery_method, min_bid, time_ending, photo, owner_uid, description from Items inner join Listings on (item_iid = iid) where owner_uid = $1 and Listings.status = $2';
            values = [req.user.username, 'open'];
            result.listings = await db.query(query, values);

            // Find users of the people you followed followed but you have not
            query = 'SELECT * FROM get_uncommon_followers($1::text)';
            values = [req.user.username];
            result.uncommonFollows = await db.query(query, values);

            res.render('user', {
                user: result.userDetails.rows[0],
                listings: result.listings.rows,
                items: result.items.rows,
                likes: result.likes.rows,
                following: result.following.rows,
                followers: result.followers.rows,
                suggestFollows: result.uncommonFollows.rows,
                isMyProfile: true
            });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        ERRORS.somethingWentWrong(e.message, next);
    }
});

// @route   GET /user/:username
// @desc    Get info on one user
// @access  Public
router.get('/:username', async (req, res, next) => {
    if (req.isAuthenticated() && req.user.username == req.params.username) {
        res.redirect('/user');
    } else {
        const result = {};
        let query = 'SELECT * FROM Users WHERE uid = $1';
        const values = [req.params.username];
        result.userDetails = await db.query(query, values);

        if (result.userDetails.rows.length === 0) {
            res.send('user does not exist');
        } else {
            query =
                'select lid, item_iid, title, Listings.status as status, delivery_method, min_bid, time_ending, photo, owner_uid, description from Items inner join Listings on (item_iid = iid) where owner_uid = $1';
            result.listings = await db.query(query, values);

            query =
                'select iid, item_name, category, status, photo from UserLikeItems inner join Items on (item_iid = iid) where user_uid = $1';
            result.likes = await db.query(query, values);

            query = 'select follower_uid from Follows where followee_uid = $1';
            result.followers = await db.query(query, values);

            query = 'select followee_uid from Follows where follower_uid = $1';
            result.following = await db.query(query, values);

            res.render('user', {
                user: result.userDetails.rows[0],
                listings: result.listings.rows,
                likes: result.likes.rows,
                following: result.following.rows,
                followers: result.followers.rows,
                isMyProfile: false
            });
        }
    }
});

// @route   POST /user/:username
// @desc    Update user
// @access  Private
router.post('/:username', async (req, res, next) => {
    const query = 'UPDATE Users ' + 'SET email = $1, address = $2, mobile = $3 ' + 'WHERE uid = $4';
    const values = [req.body.email, req.body.address, req.body.mobile, req.params.username];

    try {
        await db.query(query, values);
        res.redirect('back');
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// @route   POST /user/:username/delete
// @desc    Delete user
// @access  Private (Only Admin)
router.post('/:username/delete', async (req, res, next) => {
    const query = 'DELETE FROM Users WHERE uid = $1';
    const values = [req.params.username];

    try {
        await db.query(query, values);
        res.redirect('back');
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// @route   POST /user/:username/follow
// @desc    Follow this user
// @access  Private
router.post('/:username/follow', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const query = 'SELECT toggle_follows($1, $2)';
            const values = [req.user.username, req.params.username];
            await db.query(query, values);

            res.redirect('back');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

module.exports = router;
