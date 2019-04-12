const express = require('express');
const router = express.Router();

const Utils = require('../utils/utils');
const { User } = require('../schemas/');
const passport = require('passport');
const { ERRORS } = require('../utils/errors');
const db = require('../db/');

router.get('/', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const query =
                'select * from UserLikeItems U right outer join ListingViews L on (U.item_iid = L.iid) where owner_uid != $1 and L.status = $2 order by L.time_created, L.iid';
            const values = [req.user.username, 'open'];

            const result = await db.query(query, values);
            const parsedResult = [];
            result.rows.forEach((row) => {
                if (parsedResult.length === 0 || parsedResult[parsedResult.length - 1].iid !== row.iid) {
                    parsedResult.push({
                        lid: row.lid,
                        min_bid: row.min_bid,
                        title: row.title,
                        time_created: row.time_created,
                        time_ending: row.time_ending,
                        iid: row.iid,
                        owner_uid: row.owner_uid,
                        item_name: row.item_name,
                        category: row.category,
                        photo: row.photo,
                        liked: false
                    });
                }

                if (row.user_uid === req.user.username) {
                    parsedResult[parsedResult.length - 1].liked = true;
                }
            });

            res.render('index', {
                list: parsedResult,
                listing: true,
                message: 'Latest Listings'
            });
        } else {
            const query = 'select * from ListingViews L where L.status = $1 order by time_created';
            const values = ['open'];

            const result = await db.query(query, values);

            let noListing = false;
            if (result.rows.length === 0) noListing = true;
            res.render('index', {
                list: result.rows,
                listing: true,
                message: 'Latest Listings',
                hideNav: true
            });
        }
    } catch (e) {
        res.render('error', { error: e, message: 'something went wrong' });
    }
});

router.get('/search', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const sort = [' ', 'min_bid', 'time_created', 'L.time_created', 'numLikes'];
            const sortD = ['A', 'A', 'A', 'D', 'D', 'D'];
            const category = ['%', 'PC', 'PC1', 'PC2'];
            // const sort = [' ', ' min_bid asc,', ' L.time_created asc,', ' L.time_created desc,', ' numLikes desc,', ', numLoans desc'];
            // const category = [' ', " category = 'PC' and ", " category = 'PC1' and ", " category = 'PC2' and "];
            let query;
            let values;
            if (req.query.searchFor === 'user') {
                query = "select uid from Users where uid like '%" + req.query.query + "%'";
                const result = await db.query(query);

                res.render('index', {
                    listing: false,
                    user: true,
                    message: 'Displaying search user results for: ' + req.query.query,
                    list: result.rows,
                    search: req.query.query
                });
            } else {
                // Code for search by category and sort by bid, time_created, number of likes, number of loans

                query = 'SELECT * FROM get_search_results($1, $2, $3, $4, $5, $6)';
                values = [
                    category[req.query.category],
                    req.query.query,
                    sort[req.query.sortBy],
                    req.user.username,
                    'open',
                    sortD[req.query.sortBy]
                ];

                const result = await db.query(query, values);

                const parsedResult = [];
                result.rows.forEach((row) => {
                    if (parsedResult.length === 0 || parsedResult[parsedResult.length - 1].iid !== row.iid) {
                        parsedResult.push({
                            lid: row.lid,
                            min_bid: row.min_bid,
                            title: row.title,
                            time_created: row.time_created,
                            time_ending: row.time_ending,
                            iid: row.iid,
                            owner_uid: row.owner_uid,
                            item_name: row.item_name,
                            category: row.category,
                            photo: row.photo,
                            liked: false
                        });
                    }

                    if (row.user_uid === req.user.username) {
                        parsedResult[parsedResult.length - 1].liked = true;
                    }
                });

                res.render('index', {
                    list: parsedResult,
                    user: false,
                    listing: true,
                    message: 'Displaying search listing results for: ' + req.query.query,
                    category: req.query.category,
                    sort: req.query.sortBy,
                    search: req.query.query
                });
            }
        } else {
            if (req.query.searchFor === 'user') {
                query = "select uid from Users where uid like '%" + req.query.query + "%'";
                const result = await db.query(query);
                console.log(result.rows);

                res.render('index', {
                    listing: false,
                    user: true,
                    message: 'Displaying search user results for: ' + req.query.query,
                    list: result.rows,
                    search: req.query.query
                });
            } else {
                const sort = [' ', 'min_bid', 'time_created', 'L.time_created', 'numLikes'];
                const sortD = ['A', 'A', 'A', 'D', 'D', 'D'];
                const category = ['%', 'PC', 'PC1', 'PC2'];

                query = 'SELECT * FROM get_search_results($1, $2, $3, $4, $5, $6)';
                values = [
                    category[req.query.category],
                    req.query.query,
                    sort[req.query.sortBy],
                    '',
                    'open',
                    sortD[req.query.sortBy]
                ];

                const result = await db.query(query, values);

                let noListing = false;
                if (result.rows.length === 0) noListing = true;
                res.render('index', {
                    list: result.rows,
                    user: false,
                    listing: true,
                    message: 'Displaying search listing results for: ' + req.query.query,
                    search: req.query.query
                });
            }
        }
    } catch (e) {
        res.render('error', { error: e, message: 'something went wrong' });
    }
});

router.get('/login', (req, res, next) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        try {
            if (err) throw err;
            if (!user && info && info.message) {
                throw new Error(info.message);
            }
            req.login(user, (err) => {
                try {
                    if (err) throw err;
                    req.session.save(() => {
                        res.redirect('/');
                    });
                } catch (e) {
                    req.flash('messages', String(e.message));
                    req.session.save(() => {
                        res.redirect('back');
                    });
                }
            });
        } catch (e) {
            req.flash('messages', String(e.message));
            req.session.save(() => {
                res.redirect('back');
            });
        }
    })(req, res, next);
});

router.get('/signup', (req, res, next) => {
    res.render('signup');
});

router.post('/signup', async (req, res, next) => {
    const { client, done } = await db.client();
    try {
        const { value } = Utils.validate(req.body, User.signUpUserBody);
        await client.query('BEGIN');

        const insert1 = await db.query('INSERT INTO Accounts (uid, password) VALUES ($1::text, $2::text)', [
            value.username,
            value.password
        ]);
        if (insert1.command !== 'INSERT' || insert1.rowCount !== 1) ERRORS.somethingWentWrong();

        const insert2 = await db.query(
            'INSERT INTO Users (uid, email, address, mobile) VALUES ($1::text, $2::text, $3::text, $4::text)',
            [value.username, value.email, value.address, value.phone]
        );
        if (insert2.command !== 'INSERT' || insert2.rowCount !== 1) ERRORS.somethingWentWrong();

        await client.query('COMMIT');
        done();
        req.flash('messages', 'User registered successfully!');
        req.session.save(() => {
            res.redirect('back');
        });
    } catch (e) {
        await client.query('ROLLBACK');
        done();
        req.flash('messages', String(e.message));
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
