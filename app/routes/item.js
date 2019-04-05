var express = require('express');
var router = express.Router();

// @route   GET item/:itemId
// @desc    Get a item
// @access  Public
router.get('/:itemId', (req, res, next) => {
  res.send(`Get info for item ${req.params.itemId}`);
});

// @route   POST item/
// @desc    Add new item
// @access  Private
router.post('/', (req, res, next) => {
  res.send(`Item added`);
});

// @route   POST item/:itemId
// @desc    Update item
// @access  Private
router.post('/:itemId', (req, res, next) => {
  res.send(`Item ${req.params.itemId} updated`);
});

// @route   POST item/:itemId/delete
// @desc    Delete item
// @access  Private
router.post('/:itemId/delete', (req, res, next) => {
  res.send(`Item ${req.params.itemId} deleted`);
});

// @route   POST item/:itemId/like
// @desc    Add like for item
// @access  Private
router.post('/:itemId/like', (req, res, next) => {
  res.send(`Item ${req.params.itemId} liked`);
});

// @route   POST item/:itemId/like/delete
// @desc    Remove like for item
// @access  Private
router.post('/:itemId/like/delete', (req, res, next) => {
  res.send(`Item ${req.params.itemId} Unliked`);
});

module.exports = router;
