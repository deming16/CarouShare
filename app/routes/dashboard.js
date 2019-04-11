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
      const query = "select bid_biid, title, bidder_uid, lid from Loans L inner join Bids B on (L.bid_biid = B.biid) inner join Listings LI on (B.listing_lid = LI.lid) inner join Items I on (I.iid = LI.item_iid) where I.owner_uid = $1 AND L.status = $2"
      const values = [req.user.username, 'start'];

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
      const query = "select biid, title, status, item_iid from Bids B inner join Listings L on (B.listing_lid = L.lid) where B.bidder_uid = $1 and L.status = $2"
      const values = [req.user.username, 'open'];

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
//@desc     Item returned
//@access   Private
router.post('/loan/end/:listingId', async (req, res, next) => {
  const { client, done } = await db.client();
  try {
    if (req.isAuthenticated()) {
      await client.query('BEGIN');

      // get loan bid id
      let query = "select biid, listing_lid, bidder_uid, item_iid, title from Bids inner join Loans on (bid_biid = biid) inner join Listings on (listing_lid = lid) where listing_lid = $1";
      let values = [req.params.listingId];
      const result = await db.query(query, values);

      // Add Create Review for item
      query = "SELECT open_review($1, $2, $3)";
      values = [result.rows[0].bidder_uid, result.rows[0].item_iid, result.rows[0].title];
      await db.query(query, values);

      //delete loan
      query = "UPDATE Loans SET status = $1 WHERE bid_biid = $2";
      values = ['close', result.rows[0].biid];
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

//@route    GET /dashboard/review
//@desc     Get list of reviewable Items
//@access   Private
router.get('/review', async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      let query = "select rid, item_iid, user_uid, item_title, time_created from Reviews where user_uid = $1";
      let values = [req.user.username];
      const result = await db.query(query, values);

      res.render('dashboard', { list: result.rows, isReviewList: true });

    }
    else {
      res.redirect('/login');
    }
  } catch (e) {
    console.log(e);
  }

});

//@route    GET /dashboard/updates
//@desc     Get list of reviewable Items
//@access   Private
router.get('/updates', async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {

      let query = "SELECT F.followee_uid, I.item_name, L.time_created FROM Users U INNER JOIN Follows F ON (U.uid = F.follower_uid) INNER JOIN Items I ON (F.followee_uid = I.owner_uid) INNER JOIN Listings L ON (I.iid = L.item_iid) WHERE U.uid = $1 AND L.time_created > U.time_lastread";
      let values = [req.user.username];

      const result = await db.query(query, values);



      query = "UPDATE Users SET time_lastread = CURRENT_TIMESTAMP WHERE uid = $1";
      await db.query(query, values)

      res.render('dashboard', { list: result.rows, isUpdateList: true });

    }
    else {
      res.redirect('/login');
    }
  } catch (e) {
    console.log(e);
  }

});


module.exports = router;