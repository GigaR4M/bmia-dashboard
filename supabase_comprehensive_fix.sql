-- COMPREHENSIVE FIX SCRIPT
-- This script drops and recreates all key functions to ensure signature verification and data visibility.

-- ==========================================
-- 1. LEADERBOARD & HISTORY (Fixing "Failed to fetch" + Chart)
-- ==========================================

DROP FUNCTION IF EXISTS get_leaderboard(integer,integer,timestamp);
DROP FUNCTION IF EXISTS get_leaderboard(integer,integer);
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
    (ip.guild_id = p_guild_id OR ip.guild_id IS NULL) -- Allow legacy points
    AND (
      (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
      OR
      (p_start_date IS NULL AND (p_days IS NULL OR ip.created_at >= NOW() - (p_days || ' days')::INTERVAL))
    )
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_points DESC
  LIMIT p_limit;
$$;


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
  -- 1. Identify Top N Users CURRENTLY
  WITH top_users AS (
    SELECT 
      u.user_id,
      u.username,
      SUM(ip.points) as total_period_points
    FROM users u
    INNER JOIN interaction_points ip ON u.user_id = ip.user_id
    WHERE (ip.guild_id = p_guild_id OR ip.guild_id IS NULL)
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

  -- 3. Calculate Cumulative Points
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
      AND (ip.guild_id = p_guild_id OR ip.guild_id IS NULL)
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


-- ==========================================
-- 2. HIGHLIGHTS & USERS (Fixing "No Data" on Users Page)
-- ==========================================

-- Redefine get_top_users_by_messages to match lenient date logic for visibility
DROP FUNCTION IF EXISTS get_top_users_by_messages(bigint,integer,integer);
DROP FUNCTION IF EXISTS get_top_users_by_messages(bigint,integer,integer,timestamp);

CREATE OR REPLACE FUNCTION get_top_users_by_messages(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  discriminator TEXT,
  message_count BIGINT,
  last_seen TIMESTAMP
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id::TEXT,
    u.username,
    u.discriminator,
    COUNT(m.message_id) as message_count,
    u.last_seen
  FROM users u
  INNER JOIN messages m ON u.user_id = m.user_id
  WHERE m.guild_id = p_guild_id
    AND (
      -- If start date is provided, used it DIRECTLY (Front sends correct ISO UTC)
      (p_start_date IS NOT NULL AND m.created_at >= p_start_date)
      OR 
      -- fallback to days
      (p_start_date IS NULL AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY u.user_id, u.username, u.discriminator, u.last_seen
  ORDER BY message_count DESC
  LIMIT p_limit;
$$;


-- Redefine get_highlight_top_gamers (Ensure case-fix is present)
CREATE OR REPLACE FUNCTION get_highlight_top_gamers(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  value_seconds BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COALESCE(SUM(a.duration_seconds), 0)::BIGINT as value_seconds
  FROM users u
  INNER JOIN user_activities a ON u.user_id = a.user_id
  WHERE a.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND a.started_at >= date_trunc('year', NOW() AT TIME ZONE 'America/Sao_Paulo') -- Use current year
    AND a.duration_seconds > 0
    AND a.activity_type = 'playing' -- Confirmed lowercase
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;
