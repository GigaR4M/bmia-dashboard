-- Function to get leaderboard with date filtering
-- Run this in your Supabase SQL Editor

DROP FUNCTION IF EXISTS get_leaderboard(INTEGER);

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_limit INTEGER DEFAULT 50,
  p_days INTEGER DEFAULT NULL -- NULL means all time
)
RETURNS TABLE (
  rank BIGINT,
  user_id BIGINT,
  username TEXT,
  discriminator TEXT,
  total_points BIGINT
)
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT
    RANK() OVER (ORDER BY SUM(ip.points) DESC)::BIGINT as rank,
    u.user_id,
    u.username,
    u.discriminator,
    SUM(ip.points)::BIGINT as total_points
  FROM users u
  INNER JOIN interaction_points ip ON u.user_id = ip.user_id
  WHERE (p_days IS NULL OR ip.created_at >= NOW() - (p_days || ' days')::INTERVAL)
  GROUP BY u.user_id, u.username, u.discriminator
  ORDER BY total_points DESC
  LIMIT p_limit;
$$;
