var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   GET /admin
// @desc    Get admin home page
// @access  Private
router.get('/', (req, res, next) => {
  res.send('Admin home page, only display if account is admin');
});


// @route   GET /admin/item
// @desc    Get Item list
// @access  Private
router.get('/item', (req, res, next) => {
  const query = "select * from Items"
  db.query(query)
    .then(result => {
      res.json(result.rows);
    });

});

// @route   GET /admin/listing
// @desc    Get Listing list
// @access  Private
router.get('/listing', (req, res, next) => {
  const query = "select * from Listings"
  db.query(query)
    .then(result => {
      res.json(result.rows);
    });
});

// @route   GET /admin/user
// @desc    Get user list
// @access  Private
router.get('/user', (req, res, next) => {
  const query = "select * from Users"
  db.query(query)
    .then(result => {
      res.json(result.rows);
    });
});

module.exports = router;