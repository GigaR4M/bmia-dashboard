-- Function to get total unique active users across all activities
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
