-- GLOBAL VIEW FIX (DEBUGGING)
-- This script removes the Guild ID filter from the Leaderboard.
-- Use this if you want to see ALL data across ALL servers (or if your Guild IDs are mismatched).

DROP FUNCTION IF EXISTS get_leaderboard(bigint,integer,integer,timestamp);

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 50,
  p_days INTEGER DEFAULT NULL,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  rank BIGINT,
  user_id TEXT,
  username TEXT,
  discriminator TEXT,
  total_points BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    RANK() OVER (ORDER BY SUM(ip.points) DESC)::BIGINT as rank,
    u.user_id::TEXT,
    u.username,
    u.discriminator,
    SUM(ip.points)::BIGINT as total_points
  FROM users u
  INNER JOIN interaction_points ip ON u.user_id = ip.user_id
  WHERE 
    u.is_bot = FALSE -- Match Highlight
    AND ip.created_at >= get_start_of_year() -- Force correct date logic (Ignore p_start_date for now)
    -- AND (ip.guild_id = p_guild_id OR ip.guild_id IS NULL) -- GLOBAL VIEW for match
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_points DESC
  LIMIT p_limit;
$$;

-- Same for Ranking History
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
  WITH top_users AS (
    SELECT 
      u.user_id,
      u.username,
      SUM(ip.points) as total_period_points
    FROM users u
    INNER JOIN interaction_points ip ON u.user_id = ip.user_id
    WHERE 
      -- IGNORE GUILD
      (
        (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
        OR
        (p_start_date IS NULL AND ip.created_at >= NOW() - (p_days || ' days')::INTERVAL)
      )
    GROUP BY u.user_id, u.username
    ORDER BY total_period_points DESC
    LIMIT p_limit
  ),
  
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
      -- IGNORE GUILD
      AND (
        (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
        OR
        (p_start_date IS NULL AND ip.created_at >= NOW() - (p_days || ' days')::INTERVAL)
      )
    GROUP BY d.date, tu.user_id, tu.username
  ),

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
