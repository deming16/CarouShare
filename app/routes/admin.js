var express = require('express');
var router = express.Router();
const db = require('../db');

// @route   GET /admin
// @desc    Get admin home page
// @access  Private
router.get('/', (req, res, next) => {
    res.render('admin', { heading: 'Home' });
});

// @route   GET /admin/item
// @desc    Get Item list
// @access  Private
router.get('/item', (req, res, next) => {
    const query = 'select * from Items order by iid';
    db.query(query).then((result) => {
        res.render('admin', { list: result.rows, isItemList: true, heading: 'Items' });
    });
});

// @route   GET /admin/listing
// @desc    Get Listing list
// @access  Private
router.get('/listing', (req, res, next) => {
    const query = 'select * from Listings order by lid';
    db.query(query).then((result) => {
        res.render('admin', { list: result.rows, isListingList: true, heading: 'Listing' });
    });
});

// @route   GET /admin/user
// @desc    Get user list
// @access  Private
router.get('/user', (req, res, next) => {
    const query = 'select * from Users order by uid';
    db.query(query).then((result) => {
        res.render('admin', { list: result.rows, isUserList: true, heading: 'Users' });
    });
});

// @route   GET /admin/stats
// @desc    Get Statistics
// @access  Private
router.get('/stats', async (req, res, next) => {
    let query = 'SELECT count(*) as cat_count FROM Items I group by category';
    const chartCategory = await db.query(query);
    query = 'SELECT count(*) as user_count FROM Users U';
    const count = {};
    count.user = (await db.query(query)).rows[0].user_count;
    query = 'SELECT count(*) as listing_count FROM Listings L';
    count.listing = (await db.query(query)).rows[0].listing_count;
    query = 'SELECT count(*) as item_count FROM Items I';
    count.item = (await db.query(query)).rows[0].item_count;
    query = 'SELECT count(*) as loan_count FROM Loans L';
    count.transaction = (await db.query(query)).rows[0].loan_count;

    // user sign ups per week
    query =
        "SELECT date_part('dow', time_created), count(*) as count FROM Accounts A WHERE date_part('year',time_created) = date_part('year',CURRENT_TIMESTAMP) AND date_part('week',time_created) = date_part('week',CURRENT_TIMESTAMP) group by 1";
    let result = await db.query(query);
    let userChange = [];
    for (let i = 0; i < 7; i++) {
        userChange[i] = 0;
    }
    result.rows.forEach((row) => {
        userChange[row.date_part - 1] = row.count;
    });

    // Listings created per week
    query =
        "SELECT date_part('dow', time_created), count(*) as count FROM Listings L WHERE date_part('year',time_created) = date_part('year',CURRENT_TIMESTAMP) AND date_part('week',time_created) = date_part('week',CURRENT_TIMESTAMP) group by 1";
    result = await db.query(query);
    let listingChange = [];
    for (let i = 0; i < 7; i++) {
        listingChange[i] = 0;
    }
    result.rows.forEach((row) => {
        listingChange[row.date_part - 1] = row.count;
    });

    // Transactions created per week
    query =
        "SELECT date_part('dow', time_created), count(*) as count FROM Loans L INNER JOIN Bids B ON (bid_biid = biid) WHERE date_part('year',time_created) = date_part('year',CURRENT_TIMESTAMP) AND date_part('week',time_created) = date_part('week',CURRENT_TIMESTAMP) group by 1";
    result = await db.query(query);
    let transactChange = [];
    for (let i = 0; i < 7; i++) {
        transactChange[i] = 0;
    }
    result.rows.forEach((row) => {
        transactChange[row.date_part - 1] = row.count;
    });

    //user count, item count, lisitng count, transaction ,
    res.render('admin', {
        chartCategory: chartCategory.rows,
        count: count,
        userChange: userChange,
        listingChange: listingChange,
        transactChange: transactChange,
        statistics: true,
        heading: 'Statistics'
    });
});

module.exports = router;
