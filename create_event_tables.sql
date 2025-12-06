-- Create missing tables for Event Tracking
-- Extracted from usage in BMIA_project/database.py

CREATE TABLE IF NOT EXISTS scheduled_events (
    event_id BIGINT PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    creator_id BIGINT,
    entity_type TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
    event_id BIGINT NOT NULL REFERENCES scheduled_events(event_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    status TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_guild ON scheduled_events(guild_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON scheduled_events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
