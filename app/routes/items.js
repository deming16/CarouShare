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
  res.render('items/items');
  // 'SELECT * FROM Item;' 
});

// @route   GET items/:item
// @desc    Get a item
// @access  Public
router.get('/:item', function (req, res, next) {
  res.render('items/item', { itemname: `${req.params.item}` });
  // 'SELECT * FROM Item WHERE ${req.params.item} = iid;'
});

// @route   POST items/add
// @desc    Add new item
// @access  Private
router.post('/items/add', function (req, res, next) {
  res.send(`Item added`);
});

// @route   PUT items/update/:item
// @desc    Update item
// @access  Private
router.put('/items/update/:item', function (req, res, next) {
  res.send(`Item ${req.params.item} updated`);
});

module.exports = router;