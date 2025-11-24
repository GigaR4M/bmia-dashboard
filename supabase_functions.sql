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
