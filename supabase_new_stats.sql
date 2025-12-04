-- Function to get event stats
CREATE OR REPLACE FUNCTION get_event_stats(
    p_guild_id BIGINT,
    p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_events BIGINT,
    upcoming_events BIGINT,
    total_participants BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH event_counts AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'SCHEDULED' AND start_time > NOW()) as upcoming
        FROM scheduled_events
        WHERE guild_id = p_guild_id
        AND (p_start_date IS NULL OR start_time >= p_start_date)
    ),
    participant_counts AS (
        SELECT COUNT(*) as total
        FROM event_participants ep
        JOIN scheduled_events se ON ep.event_id = se.event_id
        WHERE se.guild_id = p_guild_id
        AND (p_start_date IS NULL OR se.start_time >= p_start_date)
    )
    SELECT 
        ec.total,
        ec.upcoming,
        pc.total
    FROM event_counts ec, participant_counts pc;
END;
$$;

-- Function to get moderation stats
CREATE OR REPLACE FUNCTION get_moderation_stats(
    p_guild_id BIGINT,
    p_days INT DEFAULT 30,
    p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_moderated BIGINT,
    last_24h BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_date TIMESTAMPTZ;
BEGIN
    IF p_start_date IS NOT NULL THEN
        v_start_date := p_start_date;
    ELSE
        v_start_date := NOW() - (p_days || ' days')::INTERVAL;
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE was_moderated = TRUE) as total_moderated,
        COUNT(*) FILTER (WHERE was_moderated = TRUE AND created_at >= NOW() - INTERVAL '24 hours') as last_24h
    FROM messages
    WHERE guild_id = p_guild_id
    AND created_at >= v_start_date;
END;
$$;
