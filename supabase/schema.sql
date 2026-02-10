-- Tables for YouTube Shorts Automation

-- Jobs table to track processing requests
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    youtube_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, downloading, transcribing, analyzing, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    result_data JSONB -- Stores the Gemini analysis result or final short paths
);

-- Channels to monitor for new content
CREATE TABLE IF NOT EXISTS monitored_channels (
    id TEXT PRIMARY KEY, -- YouTube Channel ID
    channel_name TEXT NOT NULL,
    last_processed_video_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for jobs table so frontend can listen for status updates
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
