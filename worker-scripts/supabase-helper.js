const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

async function updateJobStatus(jobId, status, extraData = {}) {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from('jobs')
            .update({ 
                status, 
                updated_at: new Date().toISOString(),
                ...extraData 
            })
            .eq('id', jobId);

        if (error) console.error('Error updating Supabase status:', error);
    } catch (err) {
        console.error('Failed to connect to Supabase:', err.message);
    }
}

module.exports = { updateJobStatus };
