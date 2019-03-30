var express = require('express');
var router = express.Router();

// @route   GET dashboard/:user
// @desc    Display dashboard page
// @access  Public
router.get('/:user', function (req, res, next) {
  res.render('dashboard');
});

module.exports = router;