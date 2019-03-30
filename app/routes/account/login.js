var express = require('express');
var router = express.Router();

// @route   GET account/login
// @desc    Display login page
// @access  Public
router.get('/', function (req, res, next) {
  res.render('account/login');
});

module.exports = router;