var express = require('express');
var router = express.Router();

const db = require('../db');

//@route    GET /dashboard
//@desc     Get dashboard page
//@access   Private
router.get('/', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('dashboard');
  }
  else {
    res.redirect('/login');
  }
});

//@route    GET /dashboard/borrow
//@desc     Get dashboard page with borrow info
//@access   Private
router.get('/borrow', async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      const query = "select bid_biid, title, owner_uid from Loans L inner join Bids B on (L.bid_biid = B.biid) inner join Listings LI on (B.listing_lid = LI.lid) inner join Items I on (I.iid = LI.item_iid) where B.bidder_uid = $1"
      const values = [req.user.username];

      const result = await db.query(query, values);
      res.render('dashboard', { list: result.rows, isBorrowList: true });
    }
    else {
      res.redirect('/login');
    }
  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }

});

//@route    GET /dashboard/loan
//@desc     Get dashboard page with loan info
//@access   Private
router.get('/loan', async (req, res, next) => {
  try {

    if (req.isAuthenticated()) {
      const query = "select bid_biid, title, bidder_uid from Loans L inner join Bids B on (L.bid_biid = B.biid) inner join Listings LI on (B.listing_lid = LI.lid) inner join Items I on (I.iid = LI.item_iid) where I.owner_uid = $1"
      const values = [req.user.username];

      const result = await db.query(query, values);
      res.render('dashboard', { list: result.rows, isLoanList: true });
    }
    else {
      res.redirect('/login');
    }

  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }
});

//@route    GET /dashboard/bid
//@desc     Get dashboard page with bid info
//@access   Private
router.get('/bid', async (req, res, next) => {
  try {

    if (req.isAuthenticated()) {
      const query = "select biid, title, status, item_iid from Bids B inner join Listings L on (B.listing_lid = L.lid) where B.bidder_uid = $1"
      const values = [req.user.username];

      const result = await db.query(query, values);
      res.render('dashboard', { list: result.rows, isBidList: true });
    }
    else {
      res.redirect('/login');
    }

  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }

});



module.exports = router;