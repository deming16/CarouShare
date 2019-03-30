var express = require('express');
var router = express.Router();

// @route   GET likes
// @desc    Display Likes List
// @access  Public
router.get('/', function (req, res, next) {
  res.render('likes');
});

module.exports = router;