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

--1 item can only have 1 listing opening at a time
CREATE OR REPLACE FUNCTION trig_func4()
RETURNS TRIGGER AS 
$$ 
BEGIN
    IF EXISTS (SELECT * FROM Listings WHERE NEW.item_iid = Listings.item_iid 
            and NEW.status = 'open' and Listings.status = 'open') THEN
        RAISE NOTICE '1 item can only have 1 listing opening at a time';
        RETURN NULL;
    ELSE
        RETURN NEW;
    END IF;
END; 
$$
LANGUAGE plpgsql;

CREATE TRIGGER trig4
BEFORE INSERT ON Listings
FOR EACH ROW
EXECUTE PROCEDURE trig_func4();

--Cannot bid after bidding ends
CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$
DECLARE
    row_exists NUMERIC;
BEGIN
    NEW.time_created = now();

    SELECT 1
    INTO row_exists
    FROM   Listings
    WHERE  lid = NEW.listing_lid and NEW.time_created > Listings.time_ending;

    IF (row_exists > 0) THEN
        RAISE NOTICE 'Cannot bid after bidding ends';
        RETURN NULL;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_time_created
BEFORE INSERT OR UPDATE ON Bids
FOR EACH ROW
EXECUTE PROCEDURE  update_timestamp(listing_lid);
