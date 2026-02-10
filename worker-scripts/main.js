const { downloadVideo } = require('./download');
const { transcribeAudio } = require('./transcribe');
const { analyzeTranscript } = require('./analyze');
const { processClip } = require('./process');
const fs = require('fs');
const path = require('path');

const { uploadToYouTube } = require('./upload');

async function main() {
    const url = process.argv[2];
    const jobId = process.argv[3] || `job_${Date.now()}`;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const outputDir = path.join(process.cwd(), 'temp', jobId);

    if (!url || !geminiApiKey) {
        console.error('Missing URL or GEMINI_API_KEY');
        process.exit(1);
    }

    try {
        await updateJobStatus(jobId, 'downloading');
        const { videoPath, audioPath } = await downloadVideo(url, outputDir);
        
        await updateJobStatus(jobId, 'transcribing');
        const { transcriptPath, srtPath } = await transcribeAudio(audioPath, outputDir);
        
        await updateJobStatus(jobId, 'analyzing');
        const transcript = fs.readFileSync(transcriptPath, 'utf8');
        const viralSegments = await analyzeTranscript(transcript, geminiApiKey);
        
        await updateJobStatus(jobId, 'processing', { result_data: { viralSegments } });
        const shorts = [];
        for (let i = 0; i < viralSegments.length; i++) {
            const segment = viralSegments[i];
            const clipPath = await processClip(videoPath, srtPath, segment.start_time, segment.end_time, outputDir, i + 1);
            
            // Auto-upload to YouTube if credentials exist
            let youtubeUrl = null;
            if (process.env.GOOGLE_REFRESH_TOKEN) {
                try {
                    const uploadResult = await uploadToYouTube(
                        clipPath, 
                        segment.title, 
                        `Watch this viral clip from ${url}! #shorts #ytshorts #viral`,
                        ['shorts', 'viral', 'podcast']
                    );
                    youtubeUrl = `https://youtube.com/shorts/${uploadResult.id}`;
                } catch (uploadErr) {
                    console.error('Failed to auto-upload short:', uploadErr.message);
                }
            }

            shorts.push({
                url: clipPath,
                youtube_url: youtubeUrl,
                duration: `${segment.start_time} - ${segment.end_time}`,
                title: segment.title,
                viral_score: segment.viral_score
            });
        }
        
        await updateJobStatus(jobId, 'completed', { result_data: { shorts } });
        const result = { jobId, status: 'completed', shorts };
        fs.writeFileSync(path.join(outputDir, 'result.json'), JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Job failed:', error);
        await updateJobStatus(jobId, 'failed', { error_message: error.message });
        const failureResult = { jobId, status: 'failed', error: error.message };
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, 'result.json'), JSON.stringify(failureResult, null, 2));
        process.exit(1);
    }
}

main();
