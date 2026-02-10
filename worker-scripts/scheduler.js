const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseKey || !googleApiKey) {
    console.error('Missing credentials for scheduler.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const youtube = google.youtube({ version: 'v3', auth: googleApiKey });

async function monitorChannels() {
    console.log('👀 Checking monitored channels...');

    const { data: channels, error } = await supabase
        .from('monitored_channels')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching channels:', error);
        return;
    }

    for (const channel of channels) {
        console.log(`Checking channel: ${channel.channel_name}`);

        try {
            const response = await youtube.search.list({
                channelId: channel.id,
                part: 'snippet',
                order: 'date',
                maxResults: 1,
                type: 'video'
            });

            if (response.data.items && response.data.items.length > 0) {
                const latestVideo = response.data.items[0];
                const videoId = latestVideo.id.videoId;

                if (videoId !== channel.last_processed_video_id) {
                    console.log(`🆕 Found new video: ${latestVideo.snippet.title}`);
                    
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    const jobId = `auto_${videoId}_${Date.now()}`;

                    // Add to jobs table
                    const { error: jobError } = await supabase
                        .from('jobs')
                        .insert([{ 
                            id: jobId, 
                            youtube_url: videoUrl, 
                            status: 'pending' 
                        }]);

                    if (!jobError) {
                        // Update channel's last processed video
                        await supabase
                            .from('monitored_channels')
                            .update({ last_processed_video_id: videoId })
                            .eq('id', channel.id);
                        
                        console.log(`✅ Created job ${jobId} and updated channel.`);
                    }
                }
            }
        } catch (err) {
            console.error(`Error checking channel ${channel.channel_name}:`, err.message);
        }
    }
}

// Check every hour
setInterval(monitorChannels, 3600000);
monitorChannels();
