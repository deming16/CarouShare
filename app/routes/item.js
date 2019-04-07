var express = require('express');
var router = express.Router();

const db = require('../db');

// ROUTES FOR THE ITEM ITSELF

// @route   GET item/:itemId
// @desc    Get a item
// @access  Public
router.get('/:itemId', async (req, res, next) => {
  try {
    const query = "select * from UserLikeItems U right outer join Items I on (U.item_iid = I.iid) where iid = $1"
    const values = [req.params.itemId];

    const result = await db.query(query, values);

    if (result.rows.length == 0) {
      res.send('no such item');
    }
    else {
      let liked = false;

      if (req.isAuthenticated()) {
        result.rows.forEach(row => {
          if (row.user_uid === req.user.username) {
            liked = true;
          }
        });
      }

      res.render('item', { item: result.rows[0], liked: liked });

    }
  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }

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
// @desc    Get the open listing
// @access  Public
router.get('/:itemId/listing', async (req, res, next) => {
  try {
    const query = "select L.lid, item_iid, owner_uid, title, L.status as status, delivery_method, min_bid, time_ending, L.time_created as listingstart, biid, bidder_uid, amount, B.time_created as biddedOn from Listings L inner join Items I on (L.item_iid = I.iid) left join Bids B on (B.listing_lid = L.lid) where I.iid = $1 and L.status = $2 order by B.amount desc"
    const values = [req.params.itemId, 'open'];

    const result = await db.query(query, values);

    let listingAvailable = false;
    let isOwner = false;
    if (result.rows.length !== 0) listingAvailable = true;
    if (req.isAuthenticated() && req.user.username === result.rows[0].owner_uid) isOwner = true;

    res.render('listing', { listing: result.rows[0], bids: result.rows, listingAvailable: listingAvailable, isOwner: isOwner });

  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }


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


// ROUTES FOR BIDDING OF LISTING

// @route   POST item/:itemId/listing/:listingId/bid/delete
// @desc    Delete Bid for open listing
// @access  Private
router.post('/:itemId/listing/:listingId/bid/delete', async (req, res, next) => {
  const { client, done } = await db.client();
  try {
    if (req.isAuthenticated()) {


      await client.query('BEGIN');

      let query = "select biid from Bids where listing_lid = $1 and bidder_uid = $2";
      let values = [req.params.listingId, req.user.username];
      const result = await db.query(query, values);

      // Delete lean first if there is bid
      if (result.rows.length !== 0) {
        query = "delete from Loans where bid_biid = $1"
        values = [result.rows[0].biid];
        await db.query(query, values);

        query = "delete from Bids where listing_lid = $1 and bidder_uid = $2";
        values = [req.params.listingId, req.user.username];
        await db.query(query, values);
      }

      await client.query('COMMIT');
      done();
      res.redirect('back');
    }
    else {
      done();
      res.redirect('/login');
    }
  } catch (e) {
    await client.query('ROLLBACK');
    done();
    res.render('error', { error: e, message: 'something went wrong' });
  }

});





// ROUTES FOR THE REVIEWS OF THE ITEM

// @route   GET item/:itemId/review
// @desc    Get all reviews for the item
// @access  Public
router.get('/:itemId/review/', (req, res, next) => {
  const query = "select iid, rid, user_uid, R.time_created, sname, content from Items I inner join Reviews R on (R.item_iid = I.iid) inner join ReviewSections RS on (RS.review_rid = R.rid) where I.iid = $1 order by R.rid, R.time_created"
  const values = [req.params.itemId];

  db.query(query, values)
    .then(result => {
      const parsedResult = [];
      result.rows.forEach(row => {
        if (parsedResult.length === 0 || parsedResult[parsedResult.length - 1].rid !== row.rid) {
          parsedResult.push({ iid: row.iid, rid: row.rid, time_created: row.time_created, user_uid: row.user_uid, sections: [] });
        }
        parsedResult[parsedResult.length - 1].sections.push({ sname: row.sname, content: row.content });


      })
      res.render('review', { reviews: parsedResult, item: result.rows[0] });
    })
})





// ROUTES FOR THE LIKE OF THE ITEM

// @route   POST item/:itemId/like
// @desc    Toggle Like for item
// @access  Private
router.post('/:itemId/like', async (req, res, next) => {
  if (req.isAuthenticated()) {
    let query = "select user_uid item_iid from UserLikeItems where user_uid = $1 and item_iid = $2"
    const values = [req.user.username, req.params.itemId];
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      query = "insert into UserLikeItems (user_uid, item_iid) values ($1, $2)"
      await db.query(query, values);
      res.redirect('back');
    }
    else {
      query = "delete from UserLikeItems where user_uid = $1 and item_iid = $2";
      await db.query(query, values);
      res.redirect('back');
    }

  }
  else {
    res.redirect('/login')
  }
});

// @route   POST item/:itemId/review
// @desc    Add new review for item
// @access  Private
router.post('/:itemId/review', (req, res, next) => {
  res.send(`Review added for item ${req.params.itemId}`);
});

module.exports = router;
