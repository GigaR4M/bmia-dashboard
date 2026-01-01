-- Fix Filter Logic: Add p_start_date parameter to RPC functions
-- HYBRID FIX:
-- 1. Daily Stats functions KEEP "AT TIME ZONE" to prevents "31/12" leak (User preference).
-- 2. Leaderboard/Ranking functions REMOVE "AT TIME ZONE" to ensure data visibility (Fixing "No Data").

-- 1. get_top_users_by_messages
DROP FUNCTION IF EXISTS get_top_users_by_messages(bigint,integer,integer);

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
      (p_start_date IS NOT NULL AND m.created_at >= p_start_date AT TIME ZONE 'America/Sao_Paulo')
      OR 
      (p_start_date IS NULL AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY u.user_id, u.username, u.discriminator, u.last_seen
  ORDER BY message_count DESC
  LIMIT p_limit;
$$;

-- 2. get_top_channels_by_messages
DROP FUNCTION IF EXISTS get_top_channels_by_messages(bigint,integer,integer);

CREATE OR REPLACE FUNCTION get_top_channels_by_messages(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  channel_id TEXT,
  channel_name TEXT,
  channel_type TEXT,
  message_count BIGINT,
  last_activity TIMESTAMP
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    c.channel_id::TEXT,
    c.channel_name,
    c.channel_type,
    COUNT(m.message_id) as message_count,
    MAX(m.created_at) as last_activity
  FROM channels c
  INNER JOIN messages m ON c.channel_id = m.channel_id
  WHERE m.guild_id = p_guild_id
    AND (
      (p_start_date IS NOT NULL AND m.created_at >= p_start_date AT TIME ZONE 'America/Sao_Paulo')
      OR 
      (p_start_date IS NULL AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY c.channel_id, c.channel_name, c.channel_type
  ORDER BY message_count DESC
  LIMIT p_limit;
$$;

-- 3. get_top_users_by_voice
DROP FUNCTION IF EXISTS get_top_users_by_voice(bigint,integer,integer);

CREATE OR REPLACE FUNCTION get_top_users_by_voice(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  discriminator TEXT,
  total_minutes BIGINT,
  last_seen TIMESTAMP
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id::TEXT,
    u.username,
    u.discriminator,
    COALESCE(SUM(v.duration_seconds) / 60, 0) as total_minutes,
    MAX(v.left_at) as last_seen
  FROM users u
  INNER JOIN voice_activity v ON u.user_id = v.user_id
  WHERE v.guild_id = p_guild_id
    AND (
      (p_start_date IS NOT NULL AND v.joined_at >= p_start_date AT TIME ZONE 'America/Sao_Paulo')
      OR 
      (p_start_date IS NULL AND v.joined_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_minutes DESC
  LIMIT p_limit;
$$;

-- 4. get_top_channels_by_voice
DROP FUNCTION IF EXISTS get_top_channels_by_voice(bigint,integer,integer);

CREATE OR REPLACE FUNCTION get_top_channels_by_voice(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  channel_id TEXT,
  channel_name TEXT,
  total_minutes BIGINT,
  join_count BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    c.channel_id::TEXT,
    c.channel_name,
    COALESCE(SUM(v.duration_seconds) / 60, 0) as total_minutes,
    COUNT(*) as join_count
  FROM channels c
  INNER JOIN voice_activity v ON c.channel_id = v.channel_id
  WHERE v.guild_id = p_guild_id
    AND (
      (p_start_date IS NOT NULL AND v.joined_at >= p_start_date AT TIME ZONE 'America/Sao_Paulo')
      OR 
      (p_start_date IS NULL AND v.joined_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY c.channel_id, c.channel_name
  ORDER BY total_minutes DESC
  LIMIT p_limit;
$$;

-- 5. get_top_users_by_activity
DROP FUNCTION IF EXISTS get_top_users_by_activity(bigint,text,integer,integer);

CREATE OR REPLACE FUNCTION get_top_users_by_activity(
  p_guild_id BIGINT,
  p_activity_name TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  user_id TEXT,
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
    u.user_id::TEXT,
    u.username,
    u.discriminator,
    COUNT(*) as session_count,
    COALESCE(SUM(a.duration_seconds), 0) as total_seconds,
    COALESCE(SUM(a.duration_seconds) / 3600.0, 0) as total_hours,
    COALESCE(AVG(a.duration_seconds) / 60.0, 0) as avg_session_minutes
  FROM users u
  INNER JOIN user_activities a ON u.user_id = a.user_id
  WHERE a.guild_id = p_guild_id
    AND a.duration_seconds IS NOT NULL
    AND a.duration_seconds > 0
    AND (p_activity_name IS NULL OR a.activity_name = p_activity_name)
    AND (
      (p_start_date IS NOT NULL AND a.started_at >= p_start_date AT TIME ZONE 'America/Sao_Paulo')
      OR 
      (p_start_date IS NULL AND a.started_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_seconds DESC
  LIMIT p_limit;
$$;

-- 6. get_leaderboard
-- MODIFIED: Removed AT TIME ZONE for p_start_date to fix "No Data" issue
DROP FUNCTION IF EXISTS get_leaderboard(integer,integer);

CREATE OR REPLACE FUNCTION get_leaderboard(
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
    (p_start_date IS NOT NULL AND ip.created_at >= p_start_date)
    OR
    (p_start_date IS NULL AND (p_days IS NULL OR ip.created_at >= NOW() - (p_days || ' days')::INTERVAL))
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_points DESC
  LIMIT p_limit;
$$;

-- 7. get_daily_message_stats
DROP FUNCTION IF EXISTS get_daily_message_stats(bigint,integer,text);

CREATE OR REPLACE FUNCTION get_daily_message_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo',
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  message_count BIGINT,
  active_users BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    (created_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
    COUNT(*) as message_count,
    COUNT(DISTINCT user_id) as active_users
  FROM messages
  WHERE guild_id = p_guild_id
    AND (
      (p_start_date IS NOT NULL AND created_at >= p_start_date AT TIME ZONE p_timezone)
      OR 
      (p_start_date IS NULL AND created_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY 1
  ORDER BY 1;
$$;

-- 8. get_daily_voice_stats
DROP FUNCTION IF EXISTS get_daily_voice_stats(bigint,integer,text);

CREATE OR REPLACE FUNCTION get_daily_voice_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo',
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  total_minutes BIGINT,
  active_users BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    (joined_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
    COALESCE(SUM(duration_seconds) / 60, 0) as total_minutes,
    COUNT(DISTINCT user_id) as active_users
  FROM voice_activity
  WHERE guild_id = p_guild_id
    AND (
      (p_start_date IS NOT NULL AND joined_at >= p_start_date AT TIME ZONE p_timezone)
      OR 
      (p_start_date IS NULL AND joined_at >= NOW() - (p_days || ' days')::INTERVAL)
    )
  GROUP BY 1
  ORDER BY 1;
$$;

-- 9. get_daily_member_stats
DROP FUNCTION IF EXISTS get_daily_member_stats(bigint,integer,text);

CREATE OR REPLACE FUNCTION get_daily_member_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo',
  p_start_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  total_members INTEGER,
  joins INTEGER,
  leaves INTEGER
)
LANGUAGE SQL
SET search_path = public
AS $$
  WITH daily_data AS (
    SELECT
      date,
      server_member_count as total_members,
      LAG(server_member_count) OVER (ORDER BY date) as prev_count
    FROM daily_stats
    WHERE guild_id = p_guild_id
      AND (
        (p_start_date IS NOT NULL AND date >= (p_start_date AT TIME ZONE p_timezone AT TIME ZONE p_timezone)::DATE)
        OR
        (p_start_date IS NULL AND date >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE - p_days)
      )
  )
  SELECT
    date,
    total_members,
    GREATEST(total_members - prev_count, 0) as joins,
    GREATEST(prev_count - total_members, 0) as leaves
  FROM daily_data
  ORDER BY date;
$$;

-- 10. get_ranking_history
-- MODIFIED: Removed AT TIME ZONE for p_start_date to fix data visibility in chart
DROP FUNCTION IF EXISTS get_ranking_history(bigint, integer, integer);

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
