-- SQL Debug Script
-- Run this to check if there is data compatible with the ranking history query

-- 1. Check if there are ANY points for this guild
-- Replace YOUR_GUILD_ID with the actual ID you are testing with (check localStorage or URL)
SELECT COUNT(*) as total_points_entries 
FROM interaction_points;

-- 2. Check points with guild_id (if column exists and is populated)
SELECT count(*) as points_with_guild
FROM interaction_points 
WHERE guild_id IS NOT NULL;

-- 3. Check top users manually
SELECT u.username, SUM(ip.points) as total
FROM users u
JOIN interaction_points ip ON u.user_id = ip.user_id
-- WHERE ip.guild_id = 123456789 -- Uncomment and put real ID
GROUP BY u.username
ORDER BY total DESC
LIMIT 5;

-- 4. Check date range of points
SELECT MIN(created_at) as first_point, MAX(created_at) as last_point
FROM interaction_points;
