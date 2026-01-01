-- FIX: Ensure get_ranking_history is correct and updated
-- This functions supports the Leaderboard Chart.

DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer);
DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer, timestamp);

CREATE OR REPLACE FUNCTION get_ranking_history(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  user_id BIGINT,
  username TEXT,
  rank BIGINT,
  total_points BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  -- 1. Identify Top N Users CURRENTLY (based on total points in period)
  WITH top_users AS (
    SELECT 
      u.user_id,
      u.username,
      SUM(ip.points) as total_period_points
    FROM users u
    INNER JOIN interaction_points ip ON u.user_id = ip.user_id
    WHERE ip.guild_id = p_guild_id
      AND (
        (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
        OR
        (p_start_date IS NULL AND ip.created_at >= NOW() - (p_days || ' days')::INTERVAL)
      )
    GROUP BY u.user_id, u.username
    ORDER BY total_period_points DESC
    LIMIT p_limit
  ),
  
  -- 2. Generate Date Series
  date_series AS (
    SELECT generate_series(
      (CASE 
         WHEN p_start_date IS NOT NULL THEN (p_start_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE
         ELSE (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE - p_days 
       END),
      (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE,
      '1 day'::interval
    )::DATE as date
  ),

  -- 3. Calculate Cumulative Points for EACH Top User for EACH Date
  daily_points AS (
    SELECT
      d.date,
      tu.user_id,
      tu.username,
      COALESCE(SUM(ip.points), 0) as cumulative_points
    FROM date_series d
    CROSS JOIN top_users tu
    LEFT JOIN interaction_points ip ON ip.user_id = tu.user_id 
      AND (ip.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE <= d.date
      AND ip.guild_id = p_guild_id
      AND (
        (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
        OR
        (p_start_date IS NULL AND ip.created_at >= NOW() - (p_days || ' days')::INTERVAL)
      )
    GROUP BY d.date, tu.user_id, tu.username
  ),

  -- 4. Rank
  ranked_daily AS (
    SELECT
      date,
      user_id,
      username,
      RANK() OVER (PARTITION BY date ORDER BY cumulative_points DESC) as rank,
      cumulative_points as total_points
    FROM daily_points
  )

  SELECT
    date,
    user_id,
    username,
    rank,
    total_points
  FROM ranked_daily
  ORDER BY date, rank;
$$;
