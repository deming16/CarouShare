--------------------------------------------
-- populate data

INSERT INTO Accounts VALUES ('admin', 'admin', '2019-04-01 13:38:09.968624');
INSERT INTO Accounts VALUES ('user', 'user', '2019-04-03 13:38:09.968624');
INSERT INTO Accounts VALUES ('alice', 'alice', '2019-04-03 13:38:09.968624');
INSERT INTO Accounts VALUES ('bob', 'bob', '2019-04-05 13:38:09.968624');
INSERT INTO Accounts VALUES ('carlo', 'carlo', '2019-04-06 13:38:09.968624');
INSERT INTO Accounts VALUES ('donkey', 'donkey', '2019-04-08 13:38:09.968624');
INSERT INTO Accounts VALUES ('emma', 'emma', '2019-04-11 13:38:09.968624');
INSERT INTO Accounts VALUES ('francis', 'francis', '2019-04-11 14:38:09.968624');
INSERT INTO Accounts VALUES ('groot', 'groot', '2019-04-11 15:38:09.968624');
INSERT INTO Accounts VALUES ('zac', 'zac', '2019-04-12 13:38:09.968624');


INSERT INTO Admins (uid) VALUES ('admin');

INSERT INTO Users (uid, email, address, mobile) VALUES ('user', 'user@user.com', '1 Clementi Rd', '+6581111111');
INSERT INTO Users (uid, email, address, mobile) VALUES ('alice', 'alice@alice.com', '2 Computing Dr', '+6592222222');
INSERT INTO Users (uid, email, address, mobile) VALUES ('bob', 'bob@bob.com', '3 Kent Ridge Rd', '+6563333533');
INSERT INTO Users (uid, email, address, mobile) VALUES ('carlo', 'carlo@carlo.com', '4 Kent Ridge Rd', '+6563233333');
INSERT INTO Users (uid, email, address, mobile) VALUES ('donkey', 'donkey@donkey.com', '5 Kent Ridge Rd', '+6567333333');
INSERT INTO Users (uid, email, address, mobile) VALUES ('emma', 'emma@emma.com', '6 Kent Ridge Rd', '+6563333433');
INSERT INTO Users (uid, email, address, mobile) VALUES ('francis', 'francis@francis.com', '7 Kent Ridge Rd', '+6562333333');
INSERT INTO Users (uid, email, address, mobile) VALUES ('groot', 'groot@groot.com', '8 Kent Ridge Rd', '+6563933333');
INSERT INTO Users (uid, email, address, mobile) VALUES ('zac', 'zac@zac.com', '9 Kent Ridge Rd', '+6563533333');


INSERT INTO Follows (follower_uid, followee_uid) VALUES ('user', 'alice');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('user', 'bob');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('bob', 'user');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('carlo', 'groot');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('groot', 'zac');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('alice', 'bob');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('alice', 'zac');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('zac', 'donkey');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('donkey', 'francis');


INSERT INTO Items (owner_uid, item_name, category) VALUES ('user', 'Mac Pro', 'Electronics');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('user', 'Lenovo', 'Electronics');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('carlo', 'HP', 'Electronics');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('bob', 'Asus', 'Electronics');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('emma', 'Scissor', 'Household');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('francis', 'TV', 'Household');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('zac', 'Dictonary', 'Book');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('alice', 'Harry Potter 2', 'Book');
INSERT INTO Items (owner_uid, item_name, category) VALUES ('groot', 'Harry Potter 7', 'Book');


INSERT INTO Reviews (item_iid, user_uid, item_title) VALUES (1, 'alice', 'Apple Laptop');


INSERT INTO ReviewSections (sname, review_rid, content) VALUES ('General', 1, 'Great!');
INSERT INTO ReviewSections (sname, review_rid, content) VALUES ('Special', 1, 'Also Great!');


INSERT INTO UserLikeItems (user_uid, item_iid) VALUES ('alice', 1);
INSERT INTO UserLikeItems (user_uid, item_iid) VALUES ('zac', 1);
INSERT INTO UserLikeItems (user_uid, item_iid) VALUES ('bob', 3);
INSERT INTO UserLikeItems (user_uid, item_iid) VALUES ('donkey', 8);


INSERT INTO Listings (item_iid, title) VALUES (1, 'Apple Laptop');
INSERT INTO Listings (item_iid, title, min_bid) VALUES (2, 'Lenovo Laptop', 20);
INSERT INTO Listings (item_iid, title, min_bid) VALUES (3, 'HP Laptop', 500);
INSERT INTO Listings (item_iid, title, min_bid) VALUES (4, 'Asus Laptop', 100);
INSERT INTO Listings (item_iid, title, status) VALUES (1, 'Closed Apple Laptop', 'close');
INSERT INTO Listings (item_iid, title, min_bid) VALUES (7, 'Dictionary', 10);
INSERT INTO Listings (item_iid, title, min_bid) VALUES (8, 'Harry Potter', 15);


INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('alice', 2, 10);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('zac', 4, 20);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('groot', 3, 30);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('carlo', 7, 20);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('emma', 3, 40);

INSERT INTO Loans (bid_biid) VALUES (1);
