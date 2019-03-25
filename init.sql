DROP TABLE IF EXISTS Account CASCADE;
DROP TABLE IF EXISTS Administrator CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Follow CASCADE;
DROP TABLE IF EXISTS Review CASCADE;
DROP TABLE IF EXISTS ReviewSection CASCADE;
DROP TABLE IF EXISTS Item CASCADE;
DROP TABLE IF EXISTS UsersLikeItem CASCADE;
DROP TABLE IF EXISTS Bid CASCADE;
DROP TABLE IF EXISTS Listing CASCADE;
DROP TABLE IF EXISTS Loan CASCADE;

CREATE TABLE Account (
	uid					VARCHAR(32),
	password			VARCHAR(32) NOT NULL,
	PRIMARY KEY (uid)
);

CREATE TABLE Administrator (
	uid					VARCHAR(32),
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Account
);

CREATE TABLE Users (
	uid					VARCHAR(32),
	email				VARCHAR(64),
	address				VARCHAR(255),
	mobile				VARCHAR(20),
	last_read			TIMESTAMP,
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) references Account
);

CREATE TABLE Follow (
	follower			VARCHAR(32),
	followee			VARCHAR(32),
	PRIMARY KEY (follower, followee),
	FOREIGN KEY (follower) REFERENCES Users,
	FOREIGN KEY (followee) REFERENCES Users
);

CREATE TABLE Item (
	iid 				INTEGER,
	item_owner			VARCHAR(32),
	item_name			VARCHAR(64) NOT NULL,
	category			VARCHAR(64) NOT NULL,
	status 				VARCHAR(64) NOT NULL,
	photo				VARCHAR(255),
	description			VARCHAR(255),
	PRIMARY KEY (iid),
	FOREIGN KEY (item_owner) references Users
);
CREATE TABLE Review (
	rid					INTEGER,
	item				INTEGER,
	Users 				VARCHAR(32),
	PRIMARY KEY (rid),
	FOREIGN KEY (item) REFERENCES Item,
	FOREIGN KEY (Users) REFERENCES Users
);

CREATE TABLE ReviewSection (
	sname 				VARCHAR(64),
	review  			INTEGER,
	content				TEXT NOT NULL,
	PRIMARY KEY (sname, review),
	FOREIGN KEY (review) REFERENCES Review
);

CREATE TABLE UsersLikeItem (
	users 				VARCHAR(32),
	item 				INTEGER,
	PRIMARY KEY (users, item),
	FOREIGN KEY (users) REFERENCES users,
	FOREIGN KEY (item) REFERENCES Item
);

CREATE TABLE Listing (
	lid 				INTEGER,
	item 				INTEGER,
	title				VARCHAR(64),
	status				VARCHAR(64),
	delivery_method		VARCHAR(64),
	min_bid				NUMERIC,
	succ_bid			NUMERIC,
	bid_start			TIMESTAMP,
	bid_end				TIMESTAMP,
	create_time			TIMESTAMP,
	PRIMARY KEY (lid),
	FOREIGN KEY (item) REFERENCES Item
);

CREATE TABLE Bid (
	biid 				INTEGER,
	bidder 				VARCHAR(32),
	points				NUMERIC NOT NULL,
	listing 			INTEGER,
	PRIMARY KEY (biid),
	FOREIGN KEY (bidder) REFERENCES Users,
	FOREIGN KEY (listing) REFERENCES Listing,
	CHECK(points >= 0)
);
CREATE TABLE Loan (
	loid				INTEGER,
	loaner				VARCHAR(32),
	borrower 			VARCHAR(32),
	listing 			INTEGER,
	start_loan 			TIMESTAMP,
	end_loan			TIMESTAMP,
	bid 				INTEGER NOT NULL,
	status 				VARCHAR(64),
	PRIMARY KEY (loid),
	FOREIGN KEY (loaner) REFERENCES Users,
	FOREIGN KEY (borrower) REFERENCES Users,
	FOREIGN KEY (listing) REFERENCES Listing,
	CHECK (bid >= 0)
);