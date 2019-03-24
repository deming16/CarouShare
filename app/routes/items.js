var express = require('express');
var router = express.Router();

// @route   GET items/test
// @desc    Test get items
// @access  Public
router.get('/test', function (req, res, next) {
  res.send('test items');
});

// @route   GET items/test
// @desc    Test get items
// @access  Public
router.get('/', function (req, res, next) {
  res.send(`Retrieving all items`);
});

// @route   GET items/test
// @desc    Test get items
// @access  Public
router.get('/:user', function (req, res, next) {
  res.send(`Retrieving items for ${req.params.user}`);
});

module.exports = router;