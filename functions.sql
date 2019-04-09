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