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
    let query = "select L.lid, item_iid, owner_uid, title, L.status as status, delivery_method, min_bid, time_ending, L.time_created as listingstart, biid, bidder_uid, amount, B.time_created as biddedOn from Listings L inner join Items I on (L.item_iid = I.iid) left join Bids B on (B.listing_lid = L.lid) where I.iid = $1 and L.status = $2 order by B.amount desc"
    let values = [req.params.itemId, 'open'];
    const result = await db.query(query, values);

    query = "select owner_uid from Items where iid = $1";
    values = [req.params.itemId];
    const user = await db.query(query, values);

    let listingAvailable = false;
    let isOwner = false;
    if (result.rows.length !== 0) listingAvailable = true;
    if (req.isAuthenticated() && req.user.username === user.rows[0].owner_uid) isOwner = true;

    res.render('listing', { listing: result.rows[0], bids: result.rows, listingAvailable: listingAvailable, isOwner: isOwner, item: req.params.itemId });

  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }


});

// @route   POST item/:itemId/listing
// @desc    Add/Update listing for item
// @access  Private
router.post('/:itemId/listing', async (req, res, next) => {
  try {
    let query = "select lid from Listings L where L.status = $1 and L.item_iid = $2";
    let values = ['open', req.params.itemId];
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      query = "insert into Listings (item_iid, title, delivery_method, min_bid) values ($1, $2, $3, $4)";
      values = [req.params.itemId, req.body.title, req.body.delivery_method, req.body.min_bid];
      await db.query(query, values);
    }
    else {
      query = "update Listings set title = $1, delivery_method = $2, min_bid = $3 where lid = $4";
      values = [req.body.title, req.body.delivery_method, req.body.min_bid, result.rows[0].lid];
      await db.query(query, values);
    }

    res.redirect(`back`);
  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }

});

// @route   POST item/:itemId/listing/delete
// @desc    Delete listing for item
// @access  Private
router.post('/:itemId/listing/delete', async (req, res, next) => {
  const { client, done } = await db.client();
  try {
    await client.query('BEGIN');

    // get the listing id
    let query = "select lid from Listings where item_iid = $1";
    let values = [req.params.itemId];
    const result = await db.query(query, values);

    if (result.rows.length !== 0) {
      // delete all bids from the listing
      query = "delete from Bids where listing_lid = $1";
      values = [result.rows[0].lid];
      await db.query(query, values);

      // delete the listing itself
      query = "delete from Listings where lid = $1";
      values = [result.rows[0].lid];
      await db.query(query, values);
    }

    await client.query('COMMIT');
    done();

    res.redirect('back');

  } catch (e) {
    await client.query('ROLLBACK');
    done();
    res.render('error', { error: e, message: 'something went wrong' });
  }
});


// ROUTES FOR BIDDING OF LISTING

// @route   POST item/:itemId/listing/:listingId/bid
// @desc    Add/Update Bid for open listing
// @access  Private
router.post('/:itemId/listing/:listingId/bid', async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      let query = "select biid, bidder_uid, listing_lid from Bids where bidder_uid = $1 and listing_lid = $2";
      let values = [req.user.username, req.params.listingId];
      const result = await db.query(query, values);
      console.log(result.rows.length === 0);
      if (result.rows.length === 0) {
        // add new bid
        query = "insert into Bids (bidder_uid, listing_lid, amount) values ($1, $2, $3)";
        values = [req.user.username, req.params.listingId, req.body.amount];
        await db.query(query, values);
      }
      else {
        // update bid
        query = "UPDATE Bids SET amount = $1 WHERE bidder_uid = $2 AND listing_lid = $3";
        values = [req.body.amount, req.user.username, req.params.listingId];

        await db.query(query, values);
      }

      res.redirect('back');
    }
    else {
      res.redirect('/login');
    }
  } catch (e) {
    res.render('error', { error: e, message: 'something went wrong' });
  }
});

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

// @route   POST item/:itemId/listing/:listingId/loan/:bidderId
// @desc    Choose winner and loan (Accept transaction)
// @access  Private
router.post('/:itemId/listing/:listingId/loan/:bidderId', async (req, res, next) => {
  const { client, done } = await db.client();
  try {
    await client.query('BEGIN');

    // get biid for the user
    let query = "select biid from Bids where bidder_uid = $1";
    let values = [req.params.bidderId];
    const result = await db.query(query, values);

    query = "insert into Loans (bid_biid) values ($1)";
    values = [result.rows[0].biid];
    await db.query(query, values);

    query = "delete from Bids where listing_lid = $1 and bidder_uid != $2";
    values = [req.params.listingId, req.params.bidderId];
    await db.query(query, values);

    query = "update Listings set status = $1 where lid = $2";
    values = ['close', req.params.listingId];
    await db.query(query, values);
    console.log('done');

    await client.query('COMMIT');
    done();
    res.redirect('back');

  } catch (e) {
    await client.query('ROLLBACK');
    done();
    res.render('error', { error: e, message: 'something went wrong' });
  }
  //Add Bid to loan
  // delete all other bids in this listing
  // Change listing status to close
});




// ROUTES FOR THE REVIEWS OF THE ITEM

// @route   GET item/:itemId/review
// @desc    Get all reviews for the item
// @access  Public
router.get('/:itemId/review/', async (req, res, next) => {
  try {
    let query = "select iid, rid, user_uid, R.time_created, sname, content from Items I inner join Reviews R on (R.item_iid = I.iid) inner join ReviewSections RS on (RS.review_rid = R.rid) where I.iid = $1 order by R.rid, R.time_created"
    let values = [req.params.itemId];
    const result = await db.query(query, values);

    const parsedResult = [];
    result.rows.forEach(row => {
      if (parsedResult.length === 0 || parsedResult[parsedResult.length - 1].rid !== row.rid) {
        parsedResult.push({ iid: row.iid, rid: row.rid, time_created: row.time_created, user_uid: row.user_uid, sections: [] });
      }
      parsedResult[parsedResult.length - 1].sections.push({ sname: row.sname, content: row.content });
    });

    res.render('review', { reviews: parsedResult, item: result.rows[0] });
  } catch (e) {
    console.log(e);
  }

})

// @route   GET item/:itemId/myreview
// @desc    Get My Review for the item
// @access  Private
router.get('/:itemId/myreview', async (req, res, next) => {
  if (req.isAuthenticated()) {
    let query = "select rid, item_iid, user_uid, sname, content from Reviews inner join ReviewSections on (rid = review_rid) where user_uid = $1";
    let values = [req.user.username];
    const result = await db.query(query, values);

    res.render('myReview', { sections: result.rows, item: req.params.itemId });
  }
  else {
    res.redirect('/login');
  }
});

// @route   POST item/:itemId/review/save
// @desc    Add/Update Review
// @access  Private
router.post('/:itemId/review/save', async (req, res, next) => {
  const { client, done } = await db.client();
  try {
    if (req.isAuthenticated()) {
      console.log(req.body);

      //Check if review already written before
      let query = "select rid, item_iid, sname from Reviews R inner join ReviewSections RS on (rid = review_rid) where user_uid = $1 and item_iid = $2";
      let values = [req.user.username, req.params.itemId];
      const result = await db.query(query, values);

      await client.query('BEGIN');

      if (result.rows.length === 0) {
        // if review dont exist yet, add new one
        query = "insert into Reviews (item_iid, user_uid) values ($1, $2) returning rid";
        values = [req.params.itemId, req.user.username];
        const review = await db.query(query, values);

        query = "insert into ReviewSections (sname, review_rid, content) values ($1, $2, $3)";
        values = [req.body.sname, review.rows[0].rid, req.body.content];
        await db.query(query, values);
      }
      else {
        // if review already exist, check if section exist
        let sectionExist = false;
        result.rows.forEach(row => {
          if (row.sname === req.body.psname) {
            sectionExist = true;
          }
        });
        if (sectionExist) {
          query = "update ReviewSections set sname = $1, content = $2 where review_rid = $3 and sname = $4";
          values = [req.body.sname, req.body.content, result.rows[0].rid, req.body.psname];
          await db.query(query, values);
        }
        else {
          query = "insert into ReviewSections (sname, review_rid, content) values ($1, $2, $3)";
          values = [req.body.sname, result.rows[0].rid, req.body.content];
          await db.query(query, values)
        }
      }

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
    console.log(e);
  }

});

// @route   POST item/:itemId/review/delete
// @desc    Delete section for review
// @access  Private
router.post('/:itemId/review/delete/:sname', async (req, res, next) => {
  try {
    // get rid
    let query = "select rid from Reviews where user_uid = $1 and item_iid = $2";
    let values = [req.user.username, req.params.itemId];
    const result = await db.query(query, values);

    // delete section
    query = "delete from ReviewSections where sname = $1 and review_rid = $2";
    values = [req.params.sname, result.rows[0].rid];
    await db.query(query, values);

    // if no more section, delete review
    query = "select rid from Reviews inner join ReviewSections on (rid = review_rid)";
    const section = await db.query(query);

    if (section.rows.length === 0) {
      query = "delete from Reviews where rid = $1";
      values = [result.rows[0].rid];
      await db.query(query, values);
    }

    res.redirect(`back`);
  } catch (e) {
    console.log(e);
  }

});




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



module.exports = router;
