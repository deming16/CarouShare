var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   GET user/:user
// @desc    Get info on one user
// @access  Public
router.get('/:user', function (req, res, next) {
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
