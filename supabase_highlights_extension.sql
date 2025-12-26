-- SQL Extension for Additional 4 Highlight Cards
-- Run this in your Supabase SQL Editor

-- 10. Crowd Magnet (Imã da Galera) - Most Reactions Received
CREATE OR REPLACE FUNCTION get_highlight_most_reactions_received(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  value BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COUNT(ip.id) as value
  FROM users u
  INNER JOIN interaction_points ip ON u.user_id = ip.user_id
  WHERE ip.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND ip.created_at >= get_start_of_year()
    AND ip.interaction_type = 'reaction_received'
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 11. The Reactive (O Reativo) - Most Reactions Given
CREATE OR REPLACE FUNCTION get_highlight_most_reactions_given(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  value BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COUNT(ip.id) as value
  FROM users u
  INNER JOIN interaction_points ip ON u.user_id = ip.user_id
  WHERE ip.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND ip.created_at >= get_start_of_year()
    AND ip.interaction_type = 'reaction_given'
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 12. Eclectic Gamer (Gamer Variado) - Most Distinct Games Played
CREATE OR REPLACE FUNCTION get_highlight_most_distinct_games(
  p_guild_id BIGINT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  value BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT 
    u.user_id,
    u.username,
    u.discriminator,
    COUNT(DISTINCT a.activity_name) as value
  FROM users u
  INNER JOIN user_activities a ON u.user_id = a.user_id
  WHERE a.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND a.started_at >= get_start_of_year()
    AND (a.activity_type = 'PLAYING' OR a.activity_type = 'playing')
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 13. The Marathoner (O Maratonista) - Longest Single Voice Session
CREATE OR REPLACE FUNCTION get_highlight_longest_session(
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
    MAX(v.duration_seconds)::BIGINT as value_seconds
  FROM users u
  INNER JOIN voice_activity v ON u.user_id = v.user_id
  WHERE v.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND v.joined_at >= get_start_of_year()
    AND v.duration_seconds IS NOT NULL
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;
