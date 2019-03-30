var express = require('express');
var router = express.Router();

// @route   GET index
// @desc    Display home page
// @access  Public
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
