var express = require('express');
var router = express.Router();

// @route   GET profile/likes
// @desc    Display Likes List
// @access  Public
router.get('/', function (req, res, next) {
  res.render('profile/likes');
});

module.exports = router;