--------------------------------------------
-- populate data

INSERT INTO Accounts (uid, password) VALUES ('admin', 'admin');
INSERT INTO Accounts (uid, password) VALUES ('user', 'user');
INSERT INTO Accounts (uid, password) VALUES ('alice', 'alice');
INSERT INTO Accounts (uid, password) VALUES ('bob', 'bob');

INSERT INTO Admins (uid) VALUES ('admin');

INSERT INTO Users (uid, email, address, mobile) VALUES ('user', 'user@user.com', '1 Clementi Rd', '+6581111111');
INSERT INTO Users (uid, email, address, mobile) VALUES ('alice', 'alice@alice.com', '2 Computing Dr', '+6592222222');
INSERT INTO Users (uid, email, address, mobile) VALUES ('bob', 'bob@bob.com', '3 Kent Ridge Rd', '+6563333333');

INSERT INTO Follows (follower_uid, followee_uid) VALUES ('user', 'alice');
INSERT INTO Follows (follower_uid, followee_uid) VALUES ('user', 'bob');

INSERT INTO Items (owner_uid, item_name, category) VALUES ('user', 'Laptop', 'PC');

INSERT INTO Reviews (item_iid, user_uid, item_title) VALUES (1, 'alice', 'Apple Laptop');

INSERT INTO ReviewSections (sname, review_rid, content) VALUES ('General', 1, 'Great!');
INSERT INTO ReviewSections (sname, review_rid, content) VALUES ('Special', 1, 'Also Great!');

INSERT INTO UserLikeItems (user_uid, item_iid) VALUES ('alice', 1);

INSERT INTO Listings (item_iid, title) VALUES (1, 'Apple Laptop');
INSERT INTO Listings (item_iid, title, status) VALUES (1, 'Closed Apple Laptop', 'close');

INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('alice', 2, 10);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('alice', 1, 10);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('bob', 1, 20);


INSERT INTO Loans (bid_biid) VALUES (1);
