-- SQL Functions for Giveaways Statistics
-- Run this in your Supabase SQL Editor

-- Function to get giveaway statistics
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

-- Function to get giveaway list with details
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

-- Function to get top giveaway participants
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

-- Function to get daily giveaway participation
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
