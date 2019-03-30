var express = require('express');
var router = express.Router();

// @route   GET follows
// @desc    Display Follow List
// @access  Public
router.get('/', function (req, res, next) {
  res.render('follows');
});

module.exports = router;
