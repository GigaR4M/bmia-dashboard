-- SQL Functions for Highlights Page (Destaques)
-- Run this in your Supabase SQL Editor

-- 1. Helper Function to get Start of Current Year
CREATE OR REPLACE FUNCTION get_start_of_year()
RETURNS TIMESTAMPTZ
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT DATE_TRUNC('year', NOW() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo';
$$;

-- 2. Highest Score (Maior Pontuação) - Current Year
CREATE OR REPLACE FUNCTION get_highlight_highest_score(
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
    SUM(ip.points)::BIGINT as value
  FROM users u
  INNER JOIN interaction_points ip ON u.user_id = ip.user_id
  WHERE u.is_bot = FALSE
    AND ip.created_at >= get_start_of_year()
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 3. Most Text Messages (Mais mensagens de texto enviadas) - Current Year
CREATE OR REPLACE FUNCTION get_highlight_most_messages(
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
    COUNT(m.message_id) as value
  FROM users u
  INNER JOIN messages m ON u.user_id = m.user_id
  WHERE m.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND m.created_at >= get_start_of_year()
    -- Hardcoded Allowed Channels from bot main.py
    AND m.channel_id IN (
        1327836428524191765, -- chat-principal
        1327836428524191766, -- sugestao-de-jogos
        1327836428524191767, -- mensagens-aleatorias
        1335674852681453650  -- prints-e-clips
    )
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 4. Most Voice Time (Mais tempo em chat de voz) - Current Year
CREATE OR REPLACE FUNCTION get_highlight_most_voice_time(
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
    COALESCE(SUM(v.duration_seconds), 0)::BIGINT as value_seconds
  FROM users u
  INNER JOIN voice_activity v ON u.user_id = v.user_id
  WHERE v.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND v.joined_at >= get_start_of_year()
    -- Hardcoded Ignored Channels from bot main.py
    AND (v.channel_id NOT IN (
        1356045946743689236, -- Três mosqueteiros
        1335352978986635468  -- AFK
    ) OR v.channel_id IS NULL)
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;

-- 5. Most Offensive Messages (Mais mensagens ofensivas apagadas) - Current Year
CREATE OR REPLACE FUNCTION get_highlight_most_offensive(
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
    COUNT(m.message_id) as value
  FROM users u
  INNER JOIN messages m ON u.user_id = m.user_id
  WHERE m.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND m.created_at >= get_start_of_year()
    AND m.was_moderated = TRUE
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 6. Most Activity Time (Mais tempo em atividade - Status) - Current Year
CREATE OR REPLACE FUNCTION get_highlight_most_activity_time(
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
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;

-- 7. Longest Time Streaming (Maior tempo fazendo live) - Current Year
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
    AND (a.activity_type = 'STREAMING' OR a.activity_name = 'Streaming') 
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;

-- 8. Most Event Participations (Mais participações em eventos) - Current Year
CREATE OR REPLACE FUNCTION get_highlight_most_events(
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
    COUNT(ep.event_id) as value
  FROM users u
  INNER JOIN event_participants ep ON u.user_id = ep.user_id
  INNER JOIN scheduled_events se ON ep.event_id = se.event_id
  WHERE se.guild_id = p_guild_id
    AND u.is_bot = FALSE
    AND se.start_time >= get_start_of_year()
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value DESC
  LIMIT p_limit;
$$;

-- 9. Most Played Game (Jogo mais jogado - Top Users who played games) - Current Year
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
    AND a.activity_type = 'playing'
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY value_seconds DESC
  LIMIT p_limit;
$$;
