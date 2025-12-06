-- Fix Activity Casing Mismatch
-- Updates SQL functions to use lowercase activity types matching the Python bot's storage format.

-- 1. get_highlight_longest_streaming (Fix: uppercase -> lowercase, include screen_share)
CREATE OR REPLACE FUNCTION get_highlight_longest_streaming(
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
    -- FIX: Check for lowercase 'streaming' and 'screen_share'
    AND (a.activity_type IN ('streaming', 'screen_share') OR a.activity_name = 'Streaming') 
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;

-- 2. get_highlight_top_gamers (Fix: uppercase -> lowercase)
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
    -- FIX: Check for lowercase 'playing'
    AND a.activity_type = 'playing'
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;

-- 3. get_top_activities (Fix: Exclusion logic with lowercase)
CREATE OR REPLACE FUNCTION get_top_activities(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
)
RETURNS TABLE (
  activity_name TEXT,
  unique_users BIGINT,
  session_count BIGINT,
  total_seconds BIGINT,
  avg_seconds NUMERIC,
  total_hours NUMERIC
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    a.activity_name,
    COUNT(DISTINCT a.user_id) as unique_users,
    COUNT(*) as session_count,
    COALESCE(SUM(a.duration_seconds), 0) as total_seconds,
    COALESCE(AVG(a.duration_seconds), 0) as avg_seconds,
    COALESCE(SUM(a.duration_seconds) / 3600.0, 0) as total_hours
  FROM user_activities a
  INNER JOIN users u ON a.user_id = u.user_id
  WHERE a.guild_id = p_guild_id 
    AND a.started_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
    AND a.duration_seconds IS NOT NULL
    AND a.duration_seconds > 0
    AND u.is_bot = FALSE
    -- FIX: Update exclusion to match lowercase types
    AND a.activity_type NOT IN ('streaming', 'screen_share')
    AND a.activity_name != 'Streaming'
  GROUP BY a.activity_name
  ORDER BY total_seconds DESC
  LIMIT p_limit;
$$;

-- 4. get_daily_activity_stats (Fix: Exclusion logic with lowercase)
CREATE OR REPLACE FUNCTION get_daily_activity_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
)
RETURNS TABLE (
  date DATE,
  total_sessions BIGINT,
  unique_users BIGINT,
  total_hours NUMERIC,
  avg_session_minutes NUMERIC
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    (a.started_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT a.user_id) as unique_users,
    COALESCE(SUM(a.duration_seconds) / 3600.0, 0) as total_hours,
    COALESCE(AVG(a.duration_seconds) / 60.0, 0) as avg_session_minutes
  FROM user_activities a
  INNER JOIN users u ON a.user_id = u.user_id
  WHERE a.guild_id = p_guild_id
    AND a.started_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
    AND a.duration_seconds IS NOT NULL
    AND a.duration_seconds > 0
    AND u.is_bot = FALSE
    -- FIX: Update exclusion to match lowercase types
    AND a.activity_type NOT IN ('streaming', 'screen_share')
    AND a.activity_name != 'Streaming'
  GROUP BY 1
  ORDER BY 1;
$$;

-- 5. get_top_users_by_activity (Fix: Exclusion logic with lowercase)
CREATE OR REPLACE FUNCTION get_top_users_by_activity(
  p_guild_id BIGINT,
  p_activity_name TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  session_count BIGINT,
  total_seconds BIGINT,
  total_hours NUMERIC,
  avg_session_minutes NUMERIC
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COUNT(*) as session_count,
    COALESCE(SUM(a.duration_seconds), 0) as total_seconds,
    COALESCE(SUM(a.duration_seconds) / 3600.0, 0) as total_hours,
    COALESCE(AVG(a.duration_seconds) / 60.0, 0) as avg_session_minutes
  FROM users u
  INNER JOIN user_activities a ON u.user_id = a.user_id
  WHERE a.guild_id = p_guild_id
    AND a.started_at >= NOW() - (p_days || ' days')::INTERVAL
    AND a.duration_seconds IS NOT NULL
    AND a.duration_seconds > 0
    AND (p_activity_name IS NULL OR a.activity_name = p_activity_name)
    AND u.is_bot = FALSE
    -- FIX: Update exclusion to match lowercase types
    AND (p_activity_name IS NOT NULL OR (a.activity_type NOT IN ('streaming', 'screen_share') AND a.activity_name != 'Streaming'))
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_seconds DESC
  LIMIT p_limit;
$$;

-- 6. get_activity_type_distribution (Fix: Exclusion logic with lowercase)
CREATE OR REPLACE FUNCTION get_activity_type_distribution(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  activity_type TEXT,
  session_count BIGINT,
  unique_users BIGINT,
  total_hours NUMERIC
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    COALESCE(a.activity_type, 'Unknown') as activity_type,
    COUNT(*) as session_count,
    COUNT(DISTINCT a.user_id) as unique_users,
    COALESCE(SUM(a.duration_seconds) / 3600.0, 0) as total_hours
  FROM user_activities a
  INNER JOIN users u ON a.user_id = u.user_id
  WHERE a.guild_id = p_guild_id
    AND a.started_at >= NOW() - (p_days || ' days')::INTERVAL
    AND a.duration_seconds IS NOT NULL
    AND a.duration_seconds > 0
    AND u.is_bot = FALSE
    -- FIX: Update exclusion to match lowercase types
    AND a.activity_type NOT IN ('streaming', 'screen_share')
    AND a.activity_name != 'Streaming'
  GROUP BY a.activity_type
  ORDER BY total_hours DESC;
$$;
