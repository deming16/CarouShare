var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   GET /search?q=query
// @desc    Display search result given query
// @access  Public
router.get('/', (req, res, next) => {
  res.send(`Display search results for ${req.query.q}`);
});

module.exports = router;