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
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_start_date TIMESTAMP;
BEGIN
    v_start_date := NOW() - (p_days || ' days')::INTERVAL;
    
    RETURN QUERY
    WITH top_users AS (
        SELECT u.user_id, u.username
        FROM users u
        INNER JOIN interaction_points ip ON u.user_id = ip.user_id
        WHERE u.is_bot = FALSE
        GROUP BY u.user_id, u.username
        ORDER BY SUM(ip.points) DESC
        LIMIT p_limit
    ),
    initial_balances AS (
        SELECT 
            ip.user_id, 
            COALESCE(SUM(ip.points), 0) as balance
        FROM interaction_points ip
        WHERE ip.user_id IN (SELECT t.user_id FROM top_users t)
        AND ip.created_at < v_start_date
        GROUP BY ip.user_id
    ),
    daily_activity AS (
        SELECT 
            ip.user_id,
            ip.created_at::DATE as activity_date,
            SUM(ip.points) as points_gained
        FROM interaction_points ip
        WHERE ip.user_id IN (SELECT t.user_id FROM top_users t)
        AND ip.created_at >= v_start_date
        GROUP BY ip.user_id, ip.created_at::DATE
    ),
    dates AS (
        SELECT generate_series(v_start_date::DATE, CURRENT_DATE, '1 day'::INTERVAL)::DATE as date
    ),
    user_dates AS (
        SELECT d.date, tu.user_id, tu.username, COALESCE(ib.balance, 0) as start_balance
        FROM dates d
        CROSS JOIN top_users tu
        LEFT JOIN initial_balances ib ON tu.user_id = ib.user_id
    ),
    final_calc AS (
        SELECT
            ud.date,
            ud.user_id,
            ud.username,
            (ud.start_balance + COALESCE(SUM(da.points_gained) OVER (PARTITION BY ud.user_id ORDER BY ud.date), 0))::BIGINT as current_total
        FROM user_dates ud
        LEFT JOIN daily_activity da ON ud.user_id = da.user_id AND ud.date = da.activity_date
    )
    SELECT
        fc.date,
        fc.user_id,
        fc.username,
        RANK() OVER (PARTITION BY fc.date ORDER BY fc.current_total DESC)::BIGINT as rank,
        fc.current_total as total_points
    FROM final_calc fc
    ORDER BY fc.date ASC, rank ASC;

END;
$$;
