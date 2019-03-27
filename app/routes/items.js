var express = require('express');
var router = express.Router();

// @route   GET items/test
// @desc    Test item routes
// @access  Public
router.get('/test', function (req, res, next) {
  res.send('test items');
});

// @route   GET items
// @desc    Get all items
// @access  Public
router.get('/', function (req, res, next) {
  res.send(`Retrieving all items`);
});

// @route   GET items/:item
// @desc    Get a item
// @access  Public
router.get('/:item', function (req, res, next) {
  res.send(`Retrieving item ${req.params.item}`);
});

module.exports = router;