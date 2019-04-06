var express = require('express');
var router = express.Router();

const db = require('../db');

// ROUTES FOR THE ITEM ITSELF

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
        res.render('item', { item: result.rows[0] });
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





// ROUTES FOR THE LISTING OF THE ITEM

// @route   GET item/:itemId/listing
// @desc    Get a listing
// @access  Public
router.get('/:itemId/listing', (req, res, next) => {
  const query = "select item_iid, title, L.status as status, delivery_method, min_bid, time_ending, L.time_created as listingstart, biid, bidder_uid, amount, B.time_created as biddedOn from Listings L inner join Items I on (L.item_iid = I.iid) inner join Bids B on (B.listing_lid = L.lid) where I.iid = $1 order by B.amount desc"
  const values = [req.params.itemId];

  db.query(query, values)
    .then(result => {
      console.log(result.rows);
      res.render('listing', { listing: result.rows[0], bids: result.rows });
    })
    .catch(err => res.render('error', { error: err, message: 'something went wrong' }))
});

// @route   POST item/:itemId/listing
// @desc    Add new listing for item
// @access  Private
router.post('/:itemId/listing', (req, res, next) => {
  res.send(`listing added`);
});

// @route   POST item/:itemId/listing
// @desc    Update listing for item
// @access  Private
router.post('/:itemId/listing', (req, res, next) => {
  res.send(`Listing for ${req.params.itemId} updated`);
});

// @route   POST item/:itemId/listing
// @desc    Delete listing for item
// @access  Private
router.post('/:itemId/listing', (req, res, next) => {
  res.send(`Listing for ${req.params.itemId} deleted`);
});





// ROUTES FOR THE REVIEWS OF THE ITEM

// @route   GET item/:itemId/review
// @desc    Get all reviews for the item
// @access  Public
router.get('/:itemId/review/', (req, res, next) => {
  const query = "select distinct iid, rid, user_uid, R.time_created, sname, content from Items I inner join Reviews R on (R.item_iid = I.iid) inner join ReviewSections RS on (RS.review_rid = R.rid) where I.iid = $1 order by R.time_created"
  const values = [req.params.itemId];

  db.query(query, values)
    .then(result => {
      console.log(result.rows[0]);
      res.render('review', { reviews: result.rows, item: result.rows[0] });
    })
})





// ROUTES FOR THE LIKE OF THE ITEM

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
