var express = require('express');
var router = express.Router();

// @route   GET login
// @desc    Display login page
// @access  Public
router.get('/', function (req, res, next) {
  res.render('login');
});

module.exports = router;