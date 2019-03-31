var express = require('express');
var router = express.Router();
const db = require('../../db');

// @route   GET followers
// @desc    Display Follower List
// @access  Public
router.get('/follower/:user', function (req, res, next) {
  db.query('SELECT follower FROM Follow WHERE followee = $1::text', [req.params.user])
    .then(result => {
      if (result.rows.length == 0) {
        res.send('this user has no followers');
      } else {
        res.render('profile/follows', { isFollower: true, list: result.rows });
      }
    });
});

// @route   GET followees
// @desc    Display Followee List
// @access  Public
router.get('/following/:user', function (req, res, next) {
  db.query('SELECT followee FROM Follow WHERE follower = $1::text', [req.params.user])
    .then(result => {
      if (result.rows.length == 0) {
        res.send('this user is not following anyone');
      } else {
        res.render('profile/follows', { isFollower: false, list: result.rows });
      }
    });
});

module.exports = router;
