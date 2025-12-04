-- Enable the pg_cron extension if not enabled (requires superuser, usually enabled by default on Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ensure the daily_stats table has the server_member_count column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_stats' AND column_name = 'server_member_count') THEN
        ALTER TABLE daily_stats ADD COLUMN server_member_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- SQL Functions to fix BIGINT ID matching issues in Supabase
-- Run this in your Supabase SQL Editor

-- Function to get top users by message count
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
    AND u.is_bot = FALSE
  GROUP BY u.user_id, u.username, u.discriminator, u.last_seen
  ORDER BY message_count DESC
  LIMIT p_limit;
$$;

-- Function to get top channels by message count
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

-- Function to get daily message stats with timezone support
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
    (m.created_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
    COUNT(*) as message_count,
    COUNT(DISTINCT m.user_id) as active_users
  FROM messages m
  INNER JOIN users u ON m.user_id = u.user_id
  WHERE m.guild_id = p_guild_id
    AND m.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND u.is_bot = FALSE
  GROUP BY 1
  ORDER BY 1;
$$;

-- Function to get daily voice stats
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
    (v.joined_at AT TIME ZONE 'UTC' AT TIME ZONE p_timezone)::DATE as date,
    COALESCE(SUM(v.duration_seconds) / 60, 0) as total_minutes,
    COUNT(DISTINCT v.user_id) as active_users
  FROM voice_activity v
  INNER JOIN users u ON v.user_id = u.user_id
  WHERE v.guild_id = p_guild_id
    AND v.joined_at >= NOW() - (p_days || ' days')::INTERVAL
    AND u.is_bot = FALSE
  GROUP BY 1
  ORDER BY 1;
$$;

-- Function to get daily member stats (Total, Joins, Leaves)
DROP FUNCTION IF EXISTS get_daily_member_stats(BIGINT, INTEGER, TEXT);

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

-- Function to get top users by voice duration
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
    AND u.is_bot = FALSE
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_minutes DESC
  LIMIT p_limit;
$$;

-- Function to get top channels by voice duration
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
