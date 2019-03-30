var express = require('express');
var router = express.Router();

// @route   GET signup
// @desc    Display signup page
// @access  Public
router.get('/', function (req, res, next) {
  res.render('signup');
});

module.exports = router;