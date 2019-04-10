--------------------------------------------
-- FUNCTIONS

-- Toggle between follow and unfollow of user
CREATE OR REPLACE FUNCTION toggle_follows(
    follower VARCHAR, 
    followee VARCHAR
) 
RETURNS NUMERIC AS $$
DECLARE
    row_exists NUMERIC;
BEGIN

    SELECT 1 
    INTO row_exists 
    FROM Follows
    WHERE follower_uid = follower and followee_uid = followee;

    IF (row_exists > 0) THEN
        DELETE FROM Follows WHERE follower_uid = follower and followee_uid = followee;
        RETURN 0;
    ELSE
        INSERT INTO Follows(follower_uid, followee_uid) VALUES(follower, followee);
        RETURN 1;
    END IF;

END; 
$$
LANGUAGE plpgsql;

-- toggle between like and no like of item
CREATE OR REPLACE FUNCTION toggle_likes(
    username VARCHAR, 
    item INTEGER
) 
RETURNS NUMERIC AS $$
DECLARE
    row_exists NUMERIC;
BEGIN

    SELECT 1 
    INTO row_exists 
    FROM UserLikeItems
    WHERE user_uid = username and item_iid = item;

    IF (row_exists > 0) THEN
        DELETE FROM UserLikeItems WHERE user_uid = username and item_iid = item;
        RETURN 0;
    ELSE
        INSERT INTO UserLikeItems(user_uid, item_iid) VALUES(username, item);
        RETURN 1;
    END IF;

END; 
$$
LANGUAGE plpgsql;

-- Open Review for item if not already
CREATE OR REPLACE FUNCTION open_review(
    username VARCHAR, 
    item     INTEGER,
    title    VARCHAR 
) 
RETURNS NUMERIC AS $$
DECLARE
    row_exists NUMERIC;
BEGIN

    SELECT 1 
    INTO row_exists 
    FROM Reviews
    WHERE user_uid = username and item_iid = item;

    IF (row_exists > 0) THEN
        RETURN 0;
    ELSE
        INSERT INTO Reviews(user_uid, item_iid, item_title) VALUES(username, item, title);
        RETURN 1;
    END IF;

END; 
$$
LANGUAGE plpgsql;

-- Get Uncommon Followers
CREATE OR REPLACE FUNCTION get_uncommon_followers(username VARCHAR)
RETURNS TABLE (
    followee VARCHAR
)
AS $$
BEGIN
    RETURN QUERY 
    SELECT FF.followee_uid
    FROM Follows F INNER JOIN Follows FF ON (F.followee_uid = FF.follower_uid)
    WHERE F.follower_uid = username
    AND FF.followee_uid != username
    AND FF.followee_uid NOT IN (SELECT followee_uid 
                                FROM   Follows 
                                WHERE  follower_uid = username);
END; 
$$
LANGUAGE plpgsql;
