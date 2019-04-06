var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   POST review/:reviewId
// @desc    Update review
// @access  Private
router.post('/:reviewId', (req, res, next) => {
  const query = "update ReviewSections set content = $1 where review_rid = $2";
  const values = ['newContent', req.params.reviewId];
  res.send(`Review ${req.params.reviewId} updated`);
});

// @route   POST review/:reviewId/delete
// @desc    Delete review
// @access  Private
router.post('/:reviewId/delete', (req, res, next) => {
  const query = "delete from Reviews where rid = $1";
  const values = [req.params.reviewId];
  res.send(`Review ${req.params.reviewId} deleted`);
});
module.exports = router;