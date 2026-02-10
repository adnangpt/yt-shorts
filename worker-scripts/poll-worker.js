const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY. Polling worker cannot start.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function pollJobs() {
    console.log('📡 Polling for pending jobs in Supabase...');

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);

    if (error) {
        console.error('Error fetching jobs:', error);
        return;
    }

    if (jobs && jobs.length > 0) {
        const job = jobs[0];
        console.log(`🚀 Starting job: ${job.id} for URL: ${job.youtube_url}`);

        try {
            // Run the main worker script for this job
            const mainScriptPath = path.join(__dirname, 'main.js');
            execSync(`node "${mainScriptPath}" "${job.youtube_url}" "${job.id}"`, { stdio: 'inherit' });
            console.log(`✅ Job ${job.id} finished successfully.`);
        } catch (err) {
            console.error(`❌ Job ${job.id} failed:`, err.message);
        }
    } else {
        console.log('😴 No pending jobs found.');
    }
}

// Poll every 30 seconds
setInterval(pollJobs, 30000);
pollJobs();
