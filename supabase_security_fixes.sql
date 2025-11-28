-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_join_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_role_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Fix mutable search paths for functions

-- From supabase_activities_functions.sql
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
    activity_name,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as session_count,
    COALESCE(SUM(duration_seconds), 0) as total_seconds,
    COALESCE(AVG(duration_seconds), 0) as avg_seconds,
    COALESCE(SUM(duration_seconds) / 3600.0, 0) as total_hours
  FROM user_activities
  WHERE guild_id = p_guild_id 
    AND started_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
    AND duration_seconds IS NOT NULL
    AND duration_seconds > 0
  GROUP BY activity_name
  ORDER BY total_seconds DESC
  LIMIT p_limit;
$$;

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
    (started_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    COALESCE(SUM(duration_seconds) / 3600.0, 0) as total_hours,
    COALESCE(AVG(duration_seconds) / 60.0, 0) as avg_session_minutes
  FROM user_activities
  WHERE guild_id = p_guild_id
    AND started_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
    AND duration_seconds IS NOT NULL
    AND duration_seconds > 0
  GROUP BY 1
  ORDER BY 1;
$$;

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
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_seconds DESC
  LIMIT p_limit;
$$;

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
    COALESCE(activity_type, 'Unknown') as activity_type,
    COUNT(*) as session_count,
    COUNT(DISTINCT user_id) as unique_users,
    COALESCE(SUM(duration_seconds) / 3600.0, 0) as total_hours
  FROM user_activities
  WHERE guild_id = p_guild_id
    AND started_at >= NOW() - (p_days || ' days')::INTERVAL
    AND duration_seconds IS NOT NULL
    AND duration_seconds > 0
  GROUP BY activity_type
  ORDER BY total_hours DESC;
$$;

-- From supabase_functions.sql
CREATE OR REPLACE FUNCTION get_top_users_by_messages(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  message_count BIGINT,
  last_seen TIMESTAMP
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COUNT(m.message_id) as message_count,
    u.last_seen
  FROM users u
  INNER JOIN messages m ON u.user_id = m.user_id
  WHERE m.guild_id = p_guild_id
    AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY u.user_id, u.username, u.discriminator, u.last_seen
  ORDER BY message_count DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_top_channels_by_messages(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  channel_id BIGINT,
  channel_name TEXT,
  channel_type TEXT,
  message_count BIGINT,
  last_activity TIMESTAMP
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    c.channel_id,
    c.channel_name,
    c.channel_type,
    COUNT(m.message_id) as message_count,
    MAX(m.created_at) as last_activity
  FROM channels c
  INNER JOIN messages m ON c.channel_id = m.channel_id
  WHERE m.guild_id = p_guild_id
    AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY c.channel_id, c.channel_name, c.channel_type
  ORDER BY message_count DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_daily_message_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
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
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION get_daily_voice_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
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
    AND joined_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION get_daily_member_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
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
      AND date >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE - p_days
  )
  SELECT
    date,
    total_members,
    GREATEST(total_members - prev_count, 0) as joins, -- Simplified: assumes growth is joins
    GREATEST(prev_count - total_members, 0) as leaves -- Simplified: assumes decline is leaves
  FROM daily_data
  ORDER BY date;
$$;

CREATE OR REPLACE FUNCTION get_top_users_by_voice(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  total_minutes BIGINT,
  last_seen TIMESTAMP
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COALESCE(SUM(v.duration_seconds) / 60, 0) as total_minutes,
    MAX(v.left_at) as last_seen
  FROM users u
  INNER JOIN voice_activity v ON u.user_id = v.user_id
  WHERE v.guild_id = p_guild_id
    AND v.joined_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_minutes DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_top_channels_by_voice(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  channel_id BIGINT,
  channel_name TEXT,
  total_minutes BIGINT,
  join_count BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    c.channel_id,
    c.channel_name,
    COALESCE(SUM(v.duration_seconds) / 60, 0) as total_minutes,
    COUNT(*) as join_count
  FROM channels c
  INNER JOIN voice_activity v ON c.channel_id = v.channel_id
  WHERE v.guild_id = p_guild_id
    AND v.joined_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY c.channel_id, c.channel_name
  ORDER BY total_minutes DESC
  LIMIT p_limit;
$$;

-- From supabase_giveaways_functions.sql
CREATE OR REPLACE FUNCTION get_giveaway_stats(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_giveaways BIGINT,
  active_giveaways BIGINT,
  ended_giveaways BIGINT,
  total_participants BIGINT,
  avg_participants_per_giveaway NUMERIC
)
LANGUAGE SQL
SET search_path = public
AS $$
  WITH giveaway_data AS (
    SELECT
      g.giveaway_id,
      g.ended,
      COUNT(DISTINCT ge.user_id) as participant_count
    FROM giveaways g
    LEFT JOIN giveaway_entries ge ON g.giveaway_id = ge.giveaway_id
    WHERE g.guild_id = p_guild_id
      AND g.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY g.giveaway_id, g.ended
  )
  SELECT
    COUNT(*)::BIGINT as total_giveaways,
    COUNT(*) FILTER (WHERE NOT ended)::BIGINT as active_giveaways,
    COUNT(*) FILTER (WHERE ended)::BIGINT as ended_giveaways,
    COALESCE(SUM(participant_count), 0)::BIGINT as total_participants,
    COALESCE(AVG(participant_count), 0) as avg_participants_per_giveaway
  FROM giveaway_data;
$$;

CREATE OR REPLACE FUNCTION get_giveaway_list(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 20,
  p_active_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  giveaway_id INTEGER,
  prize TEXT,
  winner_count INTEGER,
  host_user_id BIGINT,
  ends_at TIMESTAMP,
  ended BOOLEAN,
  created_at TIMESTAMP,
  participant_count BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    g.giveaway_id,
    g.prize,
    g.winner_count,
    g.host_user_id,
    g.ends_at,
    g.ended,
    g.created_at,
    COUNT(DISTINCT ge.user_id) as participant_count
  FROM giveaways g
  LEFT JOIN giveaway_entries ge ON g.giveaway_id = ge.giveaway_id
  WHERE g.guild_id = p_guild_id
    AND (NOT p_active_only OR NOT g.ended)
  GROUP BY g.giveaway_id, g.prize, g.winner_count, g.host_user_id, g.ends_at, g.ended, g.created_at
  ORDER BY g.created_at DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_top_giveaway_participants(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  entry_count BIGINT,
  wins_count BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    u.user_id,
    u.username,
    u.discriminator,
    COUNT(DISTINCT ge.giveaway_id) as entry_count,
    0::BIGINT as wins_count  -- TODO: Track winners in a separate table
  FROM users u
  INNER JOIN giveaway_entries ge ON u.user_id = ge.user_id
  INNER JOIN giveaways g ON ge.giveaway_id = g.giveaway_id
  WHERE g.guild_id = p_guild_id
    AND g.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY entry_count DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_daily_giveaway_participation(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
)
RETURNS TABLE (
  date DATE,
  new_giveaways BIGINT,
  total_entries BIGINT,
  unique_participants BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  WITH daily_giveaways AS (
    SELECT
      (created_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
      giveaway_id
    FROM giveaways
    WHERE guild_id = p_guild_id
      AND created_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
  ),
  daily_entries AS (
    SELECT
      (ge.entered_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
      ge.giveaway_id,
      ge.user_id
    FROM giveaway_entries ge
    INNER JOIN giveaways g ON ge.giveaway_id = g.giveaway_id
    WHERE g.guild_id = p_guild_id
      AND ge.entered_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
  ),
  date_series AS (
    SELECT generate_series(
      (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE - p_days,
      (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE,
      '1 day'::INTERVAL
    )::DATE as date
  )
  SELECT
    ds.date,
    COALESCE(COUNT(DISTINCT dg.giveaway_id), 0)::BIGINT as new_giveaways,
    COALESCE(COUNT(de.giveaway_id), 0)::BIGINT as total_entries,
    COALESCE(COUNT(DISTINCT de.user_id), 0)::BIGINT as unique_participants
  FROM date_series ds
  LEFT JOIN daily_giveaways dg ON ds.date = dg.date
  LEFT JOIN daily_entries de ON ds.date = de.date
  GROUP BY ds.date
  ORDER BY ds.date;
$$;

-- From supabase_unique_users_function.sql
CREATE OR REPLACE FUNCTION get_total_unique_active_users(
  p_guild_id BIGINT,
  p_days INTEGER DEFAULT 30,
  p_timezone TEXT DEFAULT 'America/Sao_Paulo'
)
RETURNS BIGINT
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT user_id)::BIGINT
  FROM user_activities
  WHERE guild_id = p_guild_id
    AND started_at >= (NOW() AT TIME ZONE 'UTC' AT TIME ZONE p_timezone) - (p_days || ' days')::INTERVAL
    AND duration_seconds IS NOT NULL
    AND duration_seconds > 0;
$$;
