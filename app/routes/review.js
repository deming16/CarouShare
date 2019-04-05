var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   POST review/:reviewId
// @desc    Update review
// @access  Private
router.post('/:reviewId', (req, res, next) => {
  res.send(`Review ${req.params.reviewId} updated`);
});

// @route   POST review/:reviewId/delete
// @desc    Delete review
// @access  Private
router.post('/:reviewId/delete', (req, res, next) => {
  res.send(`Review ${req.params.reviewId} deleted`);
});
module.exports = router;