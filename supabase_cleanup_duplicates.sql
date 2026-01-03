-- CLEANUP DUPLICATE FUNCTIONS
-- The error PGRST203 indicates multiple overloaded functions exist.
-- We must DROP ALL variations to resolve the ambiguity.

-- Drop Leaderboard Variations
DROP FUNCTION IF EXISTS get_leaderboard(bigint, integer, integer, timestamp);
DROP FUNCTION IF EXISTS get_leaderboard(bigint, integer, integer, timestamp with time zone);
DROP FUNCTION IF EXISTS get_leaderboard(bigint, integer, integer, timestamp without time zone);
-- Drop Legacy/Weird signatures (guild_id at end)
DROP FUNCTION IF EXISTS get_leaderboard(integer, integer, timestamp, bigint);
DROP FUNCTION IF EXISTS get_leaderboard(integer, integer, timestamp with time zone, bigint);
DROP FUNCTION IF EXISTS get_leaderboard(integer, integer, timestamp without time zone, bigint);
-- Drop Legacy signatures 
DROP FUNCTION IF EXISTS get_leaderboard(integer, integer, timestamp);
DROP FUNCTION IF EXISTS get_leaderboard(integer, integer);

-- Drop Ranking History Variations
DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer, timestamp);
DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer, timestamp with time zone);
DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer, timestamp without time zone);
DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer, timestamp with time zone, bigint); -- Just in case



-- RECREATE THE DEFINITIVE LEADERBOARD FUNCTION (Global/Legacy Friendly)
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 50,
  p_days INTEGER DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL -- Explicit TIMESTAMPTZ to match frontend ISO String
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
    u.is_bot = FALSE
    -- Global View (Matches Highlights behavior which works)
    AND (
      (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
      OR
      (p_start_date IS NULL AND (p_days IS NULL OR ip.created_at >= NOW() - (p_days || ' days')::INTERVAL))
    )
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_points DESC
  LIMIT p_limit;
$$;


-- RECREATE THE DEFINITIVE HISTORY FUNCTION
CREATE OR REPLACE FUNCTION get_ranking_history(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL -- Explicit TIMESTAMPTZ
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
      u.is_bot = FALSE
      -- Global View
      AND (
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
