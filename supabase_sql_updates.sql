-- Fix Filter Logic: Consolidating Repaired Functions
-- 1. Updates get_highlight_top_gamers to use 'playing' (lowercase).
-- 2. Updates get_leaderboard to ACCEPT p_guild_id and Apply Filter.
-- 3. Retains Hybrid logic for Daily Stats (Strict TZ) vs Leaderboard (Lenient TZ).

-- [HIGHLIGHTS FIX] 
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
    AND a.started_at >= get_start_of_year()
    AND a.duration_seconds > 0
    AND a.activity_type = 'playing' -- FIXED: Lowercase
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;


-- [LEADERBOARD FIX]
-- Dropping old signature first just in case
DROP FUNCTION IF EXISTS get_leaderboard(integer,integer,timestamp);
DROP FUNCTION IF EXISTS get_leaderboard(integer,integer); -- Dropping simpler one too

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_guild_id BIGINT, -- ADDED Guild ID
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
    ip.guild_id = p_guild_id -- ADDED Filter
    AND (
      (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
      OR
      (p_start_date IS NULL AND (p_days IS NULL OR ip.created_at >= NOW() - (p_days || ' days')::INTERVAL))
    )
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_points DESC
  LIMIT p_limit;
$$;
