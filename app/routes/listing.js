var express = require('express');
var router = express.Router();

// @route   GET listing/:listingId
// @desc    Get a listing
// @access  Public
router.get('/:listingId', (req, res, next) => {
  res.send(`Get listing ${req.params.listingId}`);
});

// @route   POST listing
// @desc    Add new listing
// @access  Private
router.post('/', (req, res, next) => {
  res.send(`listing added`);
});

// @route   POST listing/:listingId
// @desc    Update listing
// @access  Private
router.post('/:listingId', (req, res, next) => {
  res.send(`Lisintg ${req.params.listingId} updated`);
});

// @route   POST listing/:listingId/delete
// @desc    Delete listing
// @access  Private
router.post('/:listingId/delete', (req, res, next) => {
  res.send(`Item ${req.params.listingId} deleted`);
});

module.exports = router;