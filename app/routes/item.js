var express = require('express');
var router = express.Router();

const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const moment = require('moment');
const db = require('../db');

// ROUTES FOR THE ITEM ITSELF

// @route   GET item/:itemId
// @desc    Get a item
// @access  Public
router.get('/:itemId', async (req, res, next) => {
    try {
        const query = 'select * from UserLikeItems U right outer join Items I on (U.item_iid = I.iid) where iid = $1';
        const values = [req.params.itemId];

        const result = await db.query(query, values);

        if (result.rows.length == 0) {
            res.send('no such item');
        } else {
            let liked = false;
            let editable = false;

            if (req.isAuthenticated()) {
                result.rows.forEach((row) => {
                    if (row.user_uid === req.user.username) {
                        liked = true;
                    }
                    if (row.owner_uid === req.user.username) {
                        editable = true;
                    }
                });
            }

            const cat = result.rows[0].category;
            const category = [cat === 'Electronics', cat === 'Household', cat === 'Book'];
            res.render('item', {
                item: result.rows[0],
                category: category,
                liked: liked,
                editable: editable,
                itemId: req.params.itemId
            });
        }
    } catch (e) {
        next(ERRORS.somethingWentWrong(e.message));
    }
});

// @route   POST item/
// @desc    Add new item
// @access  Private
router.post('/', upload.single('photo'), async (req, res, next) => {
    let filename = req.file ? req.file.filename : null;
    const query =
        'insert into Items (owner_uid, item_name, category, status, photo, description) values ($1, $2, $3, $4, $5, $6)';
    const values = [req.user.username, req.body.itemName, req.body.category, req.body.status, filename, req.body.desc];

    try {
        await db.query(query, values);
        res.redirect('/user');
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// @route   POST item/:itemId
// @desc    Update item
// @access  Private
router.post('/:itemId', upload.single('photo'), async (req, res, next) => {
    let query = 'update Items set item_name = $1, category = $2, status = $3, description = $4 where iid = $5';
    const values = [req.body.itemName, req.body.category, req.body.status, req.body.desc, req.params.itemId];

    if (req.file && req.file.filename) {
        query =
            'update Items set item_name = $1, category = $2, status = $3, description = $4, photo = $6 where iid = $5';
        values.push(req.file.filename);
    }

    try {
        await db.query(query, values);
        res.redirect('back');
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// @route   POST item/:itemId/delete
// @desc    Delete item
// @access  Private
router.post('/:itemId/delete', async (req, res, next) => {
    const query = 'delete from Items where iid = $1';
    const values = [req.params.itemId];

    try {
        await db.query(query, values);
        res.redirect('back');
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// ROUTES FOR THE LISTING OF THE ITEM

// @route   GET item/:itemId/listing
// @desc    Get the open listing
// @access  Public
router.get('/:itemId/listing', async (req, res, next) => {
    try {
        let query =
            'select L.lid, item_iid, owner_uid, title, L.status as status, delivery_method, min_bid, time_ending, L.time_created as listingstart, biid, bidder_uid, amount, B.time_created as biddedOn from Listings L inner join Items I on (L.item_iid = I.iid) left join Bids B on (B.listing_lid = L.lid) where I.iid = $1 and L.status = $2 order by B.amount desc';
        let values = [req.params.itemId, 'open'];
        const result = await db.query(query, values);

        query = 'select owner_uid from Items where iid = $1';
        values = [req.params.itemId];
        const user = await db.query(query, values);

        let listingAvailable = false;
        let isOwner = false;
        if (result.rows.length !== 0) listingAvailable = true;
        if (req.isAuthenticated() && req.user.username === user.rows[0].owner_uid) isOwner = true;

        res.render('listing', {
            listing: result.rows[0],
            bids: result.rows,
            listingAvailable: listingAvailable,
            isOwner: isOwner,
            itemId: req.params.itemId
        });
    } catch (e) {
        next(ERRORS.somethingWentWrong(e.message));
    }
});

// @route   POST item/:itemId/listing
// @desc    Add/Update listing for item
// @access  Private
router.post('/:itemId/listing', async (req, res, next) => {
    try {
        let query = 'select lid from Listings L where L.status = $1 and L.item_iid = $2';
        let values = ['open', req.params.itemId];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            const bidEnd = moment(req.body.bid_end, 'MMM DD, YYYY').format('DD/MM/YYYY');
            query =
                "insert into Listings (item_iid, title, delivery_method, min_bid, time_ending) values ($1, $2, $3, $4, to_timestamp($5, 'DD/MM/YYYY'))";
            values = [req.params.itemId, req.body.title, req.body.delivery_method, req.body.min_bid, bidEnd];
            await db.query(query, values);
        } else {
            query = 'update Listings set title = $1, delivery_method = $2, min_bid = $3 where lid = $4';
            values = [req.body.title, req.body.delivery_method, req.body.min_bid, result.rows[0].lid];
            await db.query(query, values);
        }

        res.redirect('back');
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// @route   POST item/:itemId/listing/:listingId/delete
// @desc    Delete listing for item
// @access  Private
router.post('/:itemId/listing/:listingId/delete', async (req, res, next) => {
    const { client, done } = await db.client();
    try {
        await client.query('BEGIN');

        // delete all bids from the listing
        var query = 'delete from Bids where listing_lid = $1';
        var values = [req.params.listingId];
        await db.query(query, values);

        // delete the listing itself
        query = 'delete from Listings where lid = $1';
        values = [req.params.listingId];
        await db.query(query, values);

        await client.query('COMMIT');
        done();

        res.redirect('back');
    } catch (err) {
        await client.query('ROLLBACK');
        done();
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// ROUTES FOR BIDDING OF LISTING

// @route   POST item/:itemId/listing/:listingId/bid
// @desc    Add/Update Bid for open listing
// @access  Private
router.post('/:itemId/listing/:listingId/bid', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            let query = 'select place_bid($1, $2, $3)';
            let values = [req.user.username, req.params.listingId, req.body.amount];
            await db.query(query, values);

            res.redirect('back');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
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

            let query = 'select biid from Bids where listing_lid = $1 and bidder_uid = $2';
            let values = [req.params.listingId, req.user.username];
            const result = await db.query(query, values);

            // Delete lean first if there is bid
            if (result.rows.length !== 0) {
                query = 'delete from Loans where bid_biid = $1';
                values = [result.rows[0].biid];
                await db.query(query, values);

                query = 'delete from Bids where listing_lid = $1 and bidder_uid = $2';
                values = [req.params.listingId, req.user.username];
                await db.query(query, values);
            }

            await client.query('COMMIT');
            done();
            res.redirect('back');
        } else {
            done();
            res.redirect('/login');
        }
    } catch (err) {
        await client.query('ROLLBACK');
        done();
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// @route   POST item/:itemId/listing/:listingId/loan/:bidderId
// @desc    Choose winner and loan (Accept transaction)
// @access  Private
router.post('/:itemId/listing/:listingId/loan/:bidderId', async (req, res, next) => {
    const { client, done } = await db.client();
    try {
        await client.query('BEGIN');

        let query = 'INSERT INTO Loans (bid_biid) SELECT biid FROM Bids WHERE bidder_uid = $1 AND listing_lid = $2';
        let values = [req.params.bidderId, req.params.listingId];
        const result = await db.query(query, values);

        query = 'delete from Bids where listing_lid = $1 and bidder_uid != $2';
        values = [req.params.listingId, req.params.bidderId];
        await db.query(query, values);

        query = 'update Listings set status = $1 where lid = $2';
        values = ['close', req.params.listingId];
        await db.query(query, values);

        await client.query('COMMIT');
        done();
        res.redirect('back');
    } catch (err) {
        await client.query('ROLLBACK');
        done();
        req.flash('messages', err.message);
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

// ROUTES FOR THE REVIEWS OF THE ITEM

// @route   GET item/:itemId/review
// @desc    Get all reviews for the item
// @access  Public
router.get('/:itemId/review/', async (req, res, next) => {
    try {
        let query =
            'select iid, item_name, rid, user_uid, R.time_created, sname, content from Items I inner join Reviews R on (R.item_iid = I.iid) inner join ReviewSections RS on (RS.review_rid = R.rid) where I.iid = $1 order by R.rid, R.time_created';
        let values = [req.params.itemId];
        const result = await db.query(query, values);

        const parsedResult = [];
        result.rows.forEach((row) => {
            if (parsedResult.length === 0 || parsedResult[parsedResult.length - 1].rid !== row.rid) {
                parsedResult.push({
                    iid: row.iid,
                    rid: row.rid,
                    time_created: row.time_created,
                    time_created_text: moment(row.time_created).fromNow(),
                    user_uid: row.user_uid,
                    sections: []
                });
            }
            parsedResult[parsedResult.length - 1].sections.push({ sname: row.sname, content: row.content });
        });

        res.render('review', { reviews: parsedResult, item: result.rows[0], itemId: req.params.itemId });
    } catch (e) {
        console.log(e);
    }
});

// @route   GET item/:itemId/myreview
// @desc    Get My Review for the item
// @access  Private
router.get('/:itemId/myreview', async (req, res, next) => {
    if (req.isAuthenticated()) {
        let query =
            'select rid, item_iid, user_uid, sname, content from Reviews R inner join ReviewSections RS on (rid = review_rid) where user_uid = $1 order by RS.time_created';
        let values = [req.user.username];
        const result = await db.query(query, values);

        res.render('myReview', { sections: result.rows, item: req.params.itemId });
    } else {
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
            await client.query('BEGIN');

            //Get rid
            let query =
                'select rid, item_iid, sname from Reviews R left outer join ReviewSections RS on (rid = review_rid) where user_uid = $1 and item_iid = $2';
            let values = [req.user.username, req.params.itemId];
            const result = await db.query(query, values);

            //Check if section exist
            let sectionExist = false;
            result.rows.forEach((row) => {
                if (row.sname === req.body.psname) {
                    sectionExist = true;
                }
            });
            if (sectionExist) {
                query = 'update ReviewSections set sname = $1, content = $2 where review_rid = $3 and sname = $4';
                values = [req.body.sname, req.body.content, result.rows[0].rid, req.body.psname];
                await db.query(query, values);
            } else {
                query = 'insert into ReviewSections (sname, review_rid, content) values ($1, $2, $3)';
                values = [req.body.sname, result.rows[0].rid, req.body.content];
                await db.query(query, values);
            }

            await client.query('COMMIT');
            done();
            res.redirect('back');
        } else {
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
        let query = 'select rid from Reviews where user_uid = $1 and item_iid = $2';
        let values = [req.user.username, req.params.itemId];
        const result = await db.query(query, values);

        // delete section
        query = 'delete from ReviewSections where sname = $1 and review_rid = $2';
        values = [req.params.sname, result.rows[0].rid];
        await db.query(query, values);

        // if no more section, delete review
        query = 'select rid from Reviews inner join ReviewSections on (rid = review_rid)';
        const section = await db.query(query);

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
    try {
        if (req.isAuthenticated()) {
            const query = 'SELECT toggle_likes($1, $2::int)';
            const values = [req.user.username, req.params.itemId];
            await db.query(query, values);
            res.redirect('back');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        req.flash('messages', String(err.message));
        req.session.save(() => {
            res.redirect('back');
        });
    }
});

module.exports = router;
