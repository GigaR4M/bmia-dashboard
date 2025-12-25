-- Function to get ranking history for the top N current users
CREATE OR REPLACE FUNCTION get_ranking_history(
    p_guild_id BIGINT,
    p_days INTEGER DEFAULT 30,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    date DATE,
    user_id BIGINT,
    username TEXT,
    rank BIGINT,
    total_points BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_top_users BIGINT[];
    v_start_date TIMESTAMP;
BEGIN
    v_start_date := NOW() - (p_days || ' days')::INTERVAL;

    -- 1. Identify the CURRENT top N users
    SELECT ARRAY_AGG(user_id) INTO v_top_users
    FROM (
        SELECT u.user_id
        FROM users u
        INNER JOIN interaction_points ip ON u.user_id = ip.user_id
        WHERE u.is_bot = FALSE
        -- We calculate total points based on ALL time or just the period? 
        -- Usually "Ranking History" implies we track the history of the currently top ranked people.
        -- Let's use the standard leaderboard logic (all time sum) to pick the winners
        GROUP BY u.user_id
        ORDER BY SUM(ip.points) DESC
        LIMIT p_limit
    ) top_u;

    -- 2. Calculate daily cumulative points and rank for these users
    -- NOTE: Calculating true "Rank" relative to EVERYONE for each day is very expensive.
    -- For a "Top 10 Race" chart, we usually only care about the relative rank among themselves
    -- OR we just show their points growth.
    -- However, a Bump Chart specifically shows RANK.
    -- To calculate true rank history efficiently is hard without a daily snapshot table.
    -- Approximation: We will calculate the rank ONLY among these top N users.
    -- This is standard for such charts unless we want to query millions of rows X days.
    
    RETURN QUERY
    WITH daily_points AS (
        -- Get points earned on each day for the top users
        SELECT 
            ip.user_id,
            u.username,
            (ip.created_at::DATE) as point_date,
            SUM(ip.points) as daily_points
        FROM interaction_points ip
        JOIN users u ON ip.user_id = u.user_id
        WHERE ip.user_id = ANY(v_top_users)
        AND ip.created_at >= v_start_date
        GROUP BY 1, 2, 3
    ),
    dates AS (
        -- Generate series of dates
        SELECT generate_series(
            v_start_date::DATE,
            CURRENT_DATE,
            '1 day'::INTERVAL
        )::DATE as date
    ),
    user_cross_dates AS (
        -- Cross join users and dates to fill gaps
        SELECT 
            d.date,
            u_id as user_id,
            u_name as username
        FROM dates d
        CROSS JOIN (
            SELECT unnest(v_top_users) as u_id, u.username as u_name 
            FROM users u WHERE u.user_id = ANY(v_top_users)
        ) u
    ),
    cumulative_points AS (
        -- Calculate cumulative points up to each date
        -- We need the STARTING points before the window too if we want accuracy
        -- But for relative changes during the window, starting from 0 or partial might be misleading.
        -- Better: Calculate Total Points up to Date X.
        SELECT
            ucd.date,
            ucd.user_id,
            ucd.username,
            (
                SELECT COALESCE(SUM(ip.points), 0)
                FROM interaction_points ip
                WHERE ip.user_id = ucd.user_id
                AND ip.created_at::DATE <= ucd.date
            ) as total_points_at_date
        FROM user_cross_dates ucd
    )
    SELECT
        cp.date,
        cp.user_id,
        cp.username,
        RANK() OVER (PARTITION BY cp.date ORDER BY cp.total_points_at_date DESC)::BIGINT as rank,
        cp.total_points_at_date::BIGINT as total_points
    FROM cumulative_points cp
    ORDER BY cp.date ASC, rank ASC;

END;
$$;
