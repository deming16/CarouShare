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
  res.send('Item list for admin');
});

// @route   GET /admin/listing
// @desc    Get Listing list
// @access  Private
router.get('/listing', (req, res, next) => {
  res.send('Listing list for admin');
});

// @route   GET /admin/user
// @desc    Get user list
// @access  Private
router.get('/user', (req, res, next) => {
  res.send('User list for admin');
});

module.exports = router;