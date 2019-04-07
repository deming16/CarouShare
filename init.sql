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
    mobile              VARCHAR(20),
    time_lastread       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid),
    FOREIGN KEY (uid) references Accounts
);

CREATE TABLE Follows (
    follower_uid        VARCHAR(64) NOT NULL,
    followee_uid        VARCHAR(64) NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_uid, followee_uid),
    FOREIGN KEY (follower_uid) REFERENCES Users,
    FOREIGN KEY (followee_uid) REFERENCES Users
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
    FOREIGN KEY (owner_uid) references Users
);

CREATE TABLE Reviews (
    rid                 SERIAL,
    item_iid            INTEGER NOT NULL,
    user_uid            VARCHAR(64) NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rid),
    FOREIGN KEY (item_iid) REFERENCES Items,
    FOREIGN KEY (user_uid) REFERENCES Users
);

CREATE TABLE ReviewSections (
    sname               VARCHAR(64) NOT NULL,
    review_rid          INTEGER NOT NULL,
    content             TEXT NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sname, review_rid),
    FOREIGN KEY (review_rid) REFERENCES Reviews
);

CREATE TABLE UserLikeItems (
    user_uid            VARCHAR(64) NOT NULL,
    item_iid            INTEGER NOT NULL,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_uid, item_iid),
    FOREIGN KEY (user_uid) REFERENCES Users,
    FOREIGN KEY (item_iid) REFERENCES Items
);

CREATE TABLE Listings (
    lid                 SERIAL,
    item_iid            INTEGER NOT NULL,
    title               VARCHAR(64) NOT NULL,
    status              VARCHAR(64) NOT NULL DEFAULT 'open',
    delivery_method     VARCHAR(64),
    min_bid             NUMERIC(16, 2) NOT NULL DEFAULT 0,
    time_ending         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_created        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lid),
    FOREIGN KEY (item_iid) REFERENCES Items,
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
    PRIMARY KEY (biid),
    FOREIGN KEY (bidder_uid) REFERENCES Users,
    FOREIGN KEY (listing_lid) REFERENCES Listings,
    CHECK (amount >= 0),
    CHECK (time_start <= time_end)
);

CREATE TABLE Loans (
    bid_biid            INTEGER NOT NULL,
    status              VARCHAR(64),
    PRIMARY KEY (bid_biid),
    FOREIGN KEY (bid_biid) REFERENCES Bids
);

create view ListingViews (lid, min_bid, title, time_created, time_ending, iid, owner_uid, item_name, category, photo, status ) as 
  select L.lid, L.min_bid, L.title, L.time_created, L.time_ending, I.iid, I.owner_uid, I.item_name, I.category, I.photo, L.status 
  from Items I inner join Listings L on (I.iid = L.item_iid); 



--------------------------------------------
-- TRIGGERS

-- 1 account cannot be both admin and user
-- A user cannot have same uid as existing admin
CREATE OR REPLACE FUNCTION trig_func1()
RETURNS TRIGGER AS 
$$ 
BEGIN
    IF EXISTS (SELECT * FROM Admins WHERE NEW.uid = Admins.uid) THEN
        RAISE NOTICE '1 account cannot be both admin and user';
        RETURN NULL;
    ELSE
        RETURN NEW;
    END IF;
END; 
$$
LANGUAGE plpgsql;

CREATE TRIGGER trig1
BEFORE INSERT OR UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE trig_func1();

-- 1 account cannot be both admin and user
-- An admin cannot have same uid as existing user
CREATE OR REPLACE FUNCTION trig_func2()
RETURNS TRIGGER AS 
$$ 
BEGIN
    IF EXISTS (SELECT * FROM Users WHERE NEW.uid = Users.uid) THEN
        RAISE NOTICE '1 account cannot be both admin and user';
        RETURN NULL;
    ELSE
        RETURN NEW;
    END IF;
END; 
$$
LANGUAGE plpgsql;

CREATE TRIGGER trig2
BEFORE INSERT OR UPDATE ON Admins
FOR EACH ROW
EXECUTE PROCEDURE trig_func2();

-- 1 bidder (user) can only have 1 bid for 1 listing
CREATE OR REPLACE FUNCTION trig_func3()
RETURNS TRIGGER AS 
$$ 
BEGIN
    IF EXISTS (SELECT * FROM Bids WHERE NEW.bidder_uid = Bids.bidder_uid 
            and NEW.listing_lid = Bids.listing_lid) THEN
        RAISE NOTICE '1 bidder (user) can only have 1 bid for 1 listing';
        RETURN NULL;
    ELSE
        RETURN NEW;
    END IF;
END; 
$$
LANGUAGE plpgsql;

CREATE TRIGGER trig3
BEFORE INSERT ON Bids
FOR EACH ROW
EXECUTE PROCEDURE trig_func3();




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

INSERT INTO Reviews (item_iid, user_uid) VALUES (1, 'alice');

INSERT INTO ReviewSections (sname, review_rid, content) VALUES ('General', 1, 'Great!');
INSERT INTO ReviewSections (sname, review_rid, content) VALUES ('Special', 1, 'Also Great!');

INSERT INTO UserLikeItems (user_uid, item_iid) VALUES ('alice', 1);

INSERT INTO Listings (item_iid, title) VALUES (1, 'Apple Laptop');
INSERT INTO Listings (item_iid, title, status) VALUES (1, 'Closed Apple Laptop', 'close');

INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('alice', 2, 10);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('alice', 1, 10);
INSERT INTO Bids (bidder_uid, listing_lid, amount) VALUES ('bob', 1, 20);


INSERT INTO Loans (bid_biid) VALUES (1);

