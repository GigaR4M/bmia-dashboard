-- DEBUG: FORCE DUMMY DATA
-- This script overrides get_leaderboard to returns static data.
-- This tests if the API is successfully Calling the function and Receiving data.

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_guild_id BIGINT,
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
    1::BIGINT as rank,
    '123456789'::TEXT as user_id,
    'DEBUG_TEST_USER'::TEXT as username,
    '0000'::TEXT as discriminator,
    9999::BIGINT as total_points;
$$;
