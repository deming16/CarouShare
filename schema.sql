DROP TABLE IF EXISTS Accounts CASCADE;
DROP TABLE IF EXISTS Admins CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Follows CASCADE;
DROP TABLE IF EXISTS Items CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS ReviewSections CASCADE;
DROP TABLE IF EXISTS UserLikeItems CASCADE;
DROP TABLE IF EXISTS Listings CASCADE;
DROP TABLE IF EXISTS Bids CASCADE;
DROP TABLE IF EXISTS Loans CASCADE;
DROP TABLE IF EXISTS CompletedLoans CASCADE;

CREATE TABLE Accounts (
    uid                 VARCHAR(64),
    password            VARCHAR(64) NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid)
);

CREATE TABLE Admins (
    uid                 VARCHAR(64),
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) REFERENCES Accounts
);

CREATE TABLE Users (
    uid                 VARCHAR(64),
    email               VARCHAR(255),
    address             VARCHAR(255),
    mobile              VARCHAR(20) check (mobile ~ '^\+[0-9]*$'),
    time_lastread       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) references Accounts
);

CREATE TABLE Follows (
    follower_uid        VARCHAR(64) NOT NULL,
    followee_uid        VARCHAR(64) NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_uid, followee_uid),
    FOREIGN KEY (follower_uid) REFERENCES Users on delete cascade,
    FOREIGN KEY (followee_uid) REFERENCES Users on delete cascade
);

CREATE TABLE Items (
    iid                 SERIAL,
    owner_uid           VARCHAR(64) NOT NULL,
    item_name           VARCHAR(64) NOT NULL,
    category            VARCHAR(64) NOT NULL,
    status              VARCHAR(64),
    photo               VARCHAR(255),
    description         TEXT,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (iid),
    FOREIGN KEY (owner_uid) references Users on delete cascade
);

CREATE TABLE Reviews (
    rid                 SERIAL,
    item_iid            INTEGER NOT NULL,
    item_title          VARCHAR(64) NOT NULL,
    user_uid            VARCHAR(64) NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rid),
    FOREIGN KEY (item_iid) REFERENCES Items on delete cascade,
    FOREIGN KEY (user_uid) REFERENCES Users on delete cascade
);

CREATE TABLE ReviewSections (
    sname               VARCHAR(64) NOT NULL,
    review_rid          INTEGER NOT NULL,
    content             TEXT NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sname, review_rid),
    FOREIGN KEY (review_rid) REFERENCES Reviews on delete cascade
);

CREATE TABLE UserLikeItems (
    user_uid            VARCHAR(64) NOT NULL,
    item_iid            INTEGER NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_uid, item_iid),
    FOREIGN KEY (user_uid) REFERENCES Users on delete cascade,
    FOREIGN KEY (item_iid) REFERENCES Items on delete cascade
);

CREATE TABLE Listings (
    lid                 SERIAL,
    item_iid            INTEGER NOT NULL,
    title               VARCHAR(64) NOT NULL,
    status              VARCHAR(64) NOT NULL DEFAULT 'open',
    delivery_method     VARCHAR(64),
    min_bid             NUMERIC(16, 2) NOT NULL DEFAULT 0,
    time_ending         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + interval '1' day,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lid),
    FOREIGN KEY (item_iid) REFERENCES Items on delete cascade,
    CHECK (min_bid >= 0)
);

CREATE TABLE Bids (
    biid                SERIAL,
    bidder_uid          VARCHAR(64) NOT NULL,
    listing_lid         INTEGER NOT NULL,
    amount              NUMERIC(16, 2) NOT NULL DEFAULT 0,
    time_start          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_end            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (bidder_uid, listing_lid),
    PRIMARY KEY (biid),
    FOREIGN KEY (bidder_uid) REFERENCES Users on delete cascade,
    FOREIGN KEY (listing_lid) REFERENCES Listings on delete cascade,
    CHECK (amount >= 0),
    CHECK (time_start <= time_end)
);

CREATE TABLE Loans (
    bid_biid            INTEGER NOT NULL,
    status              VARCHAR(64) DEFAULT 'start',
    PRIMARY KEY (bid_biid),
    FOREIGN KEY (bid_biid) REFERENCES Bids(biid) on delete cascade
);


CREATE VIEW ListingViews (lid, min_bid, title, time_created, time_ending, iid, owner_uid, item_name, category, photo, status ) AS 
  SELECT L.lid, L.min_bid, L.title, L.time_created, L.time_ending, I.iid, I.owner_uid, I.item_name, I.category, I.photo, L.status 
  FROM Items I INNER JOIN Listings L ON (I.iid = L.item_iid); 

CREATE VIEW ItemLikes (iid, numLikes) AS
  SELECT I.iid, count(U.user_uid)
  FROM UserLikeItems U RIGHT OUTER JOIN Items I ON (U.item_iid = I.iid)
  GROUP BY I.iid