-- Enable RLS on leaderboard_config table
-- This secures the table from public access via PostgREST API (anon/authenticated roles)
-- The Discord bot (using service_role or admin privileges) will still have access
ALTER TABLE public.leaderboard_config ENABLE ROW LEVEL SECURITY;

-- No policies are added, which implies "DENY ALL" for roles subject to RLS.
-- This is the desired behavior as the frontend does not use this table.
