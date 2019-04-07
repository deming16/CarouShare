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
      const query = "select bid_biid, title, bidder_uid, lid from Loans L inner join Bids B on (L.bid_biid = B.biid) inner join Listings LI on (B.listing_lid = LI.lid) inner join Items I on (I.iid = LI.item_iid) where I.owner_uid = $1"
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


//@route    POST /dashboard/loan/end/listingId
//@desc     Item returned, delete loan and respective listing and bid 
//@access   Private
router.post('/loan/end/:listingId', async (req, res, next) => {
  const { client, done } = await db.client();
  try {
    if (req.isAuthenticated()) {
      await client.query('BEGIN');

      // get loan bid id
      let query = "select biid, listing_lid from Bids inner join Loans on (bid_biid = biid) where listing_lid = $1";
      let values = [req.params.listingId];
      const result = await db.query(query, values);

      //delete loan
      query = "delete from Loans where bid_biid = $1";
      values = [result.rows[0].biid];
      await db.query(query, values);

      //delete bid
      query = "delete from Bids where biid = $1";
      await db.query(query, values);

      //delete listing
      query = "delete from Listings where lid = $1";
      values = [result.rows[0].listing_lid];
      await db.query(query, values);

      await client.query('COMMIT');
      done();

      res.redirect('back');
    }
    else {
      res.redirect('/login');
    }

  } catch (e) {
    await client.query('ROLLBACK');
    done();
    res.render('error', { error: e, message: 'something went wrong' });
  }

})


module.exports = router;