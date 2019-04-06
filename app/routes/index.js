const express = require('express');
const router = express.Router();

const Utils = require('../utils/utils');
const { User } = require('../schemas/');
const passport = require('passport');
const { ERRORS } = require('../utils/errors');
const db = require('../db/');

router.get('/', (req, res, next) => {
    if (req.isAuthenticated()) {
        const query = "select * from ListingViews where owner_uid != $1 order by time_created";
        const values = [req.user.username];
        db.query(query, values)
            .then(result => {
                if (result.rows.length === 0) {
                    res.render('index', { noListing: true });
                } else {
                    res.render('index', { listing: result.rows, noListing: false });
                }
            });
    }
    else {
        const query = "select * from ListingViews order by time_created";
        db.query(query)
            .then(result => {
                if (result.rows.length === 0) {
                    res.send('There are no listings', { noListing: true });
                } else {
                    res.render('index', { listing: result.rows, noListing: false });
                }
            });
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
                    return res.redirect('/');
                } catch (e) {
                    res.redirect(`/login?message_body=${e.message}`);
                }
            });
        } catch (e) {
            res.redirect(`/login?message_body=${e.message}`);
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
        res.redirect(`/login?message_body=${encodeURIComponent('User registered successfully!')}`);
    } catch (e) {
        await client.query('ROLLBACK');
        done();
        res.redirect(`/signup?message_body=${e.message}`);
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
