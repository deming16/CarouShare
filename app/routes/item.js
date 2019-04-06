var express = require('express');
var router = express.Router();

const db = require('../db');

// @route   GET item/:itemId
// @desc    Get a item
// @access  Public
router.get('/:itemId', (req, res, next) => {
  const query = "select * from Items where iid = $1"
  const values = [req.params.itemId];

  db.query(query, values)
    .then(result => {
      if (result.rows.length == 0) {
        res.send('no such item');
      }
      else {
        res.json(result.rows[0]);
      }
    })
    .catch(err => {
      res.render('error', { error: err, message: 'something went wrong' });
    });
});

// @route   POST item/
// @desc    Add new item
// @access  Private
router.post('/', (req, res, next) => {
  const query = "insert into Items (owner_uid, item_name, category, status, photo, description) values ($1, $2, $3, $4, $5, $6)";
  const values = [req.user.username, req.body.itemName, req.body.category, req.body.status, req.body.photo, req.body.desc];

  db.query(query, values)
    .then(() => res.redirect('/user'))
    .catch(err => res.render('error', { error: err, message: 'something went wrong' }));
});

// @route   POST item/:itemId
// @desc    Update item
// @access  Private
router.post('/:itemId', (req, res, next) => {
  const query = "update Items set item_name = $1, category = $2, status = $3, photo = $4, description = $5 where iid = $6"
  const values = ['updatedName', 'category', 'status1', 'photo1', 'newDesc', req.params.itemId];

  db.query(query, values)
    .then(() => res.send('item updated'))
    .catch(err => res.render('error', { error: err, message: 'something went wrong' }));
});

// @route   POST item/:itemId/delete
// @desc    Delete item
// @access  Private
router.post('/:itemId/delete', (req, res, next) => {
  const query = "delete from Items where iid = $1"
  const values = [req.params.itemId];

  db.query(query, values)
    .then(() => res.send('item deleted'))
    .catch(err => res.render('error', { error: err, message: 'something went wrong' }));
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

// @route   POST item/:itemId/review
// @desc    Add new review for item
// @access  Private
router.post('/:itemId/review', (req, res, next) => {
  res.send(`Review added for item ${req.params.itemId}`);
});

module.exports = router;
