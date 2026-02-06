const { downloadVideo } = require('./download');
const { transcribeAudio } = require('./transcribe');
const { analyzeTranscript } = require('./analyze');
const { processClip } = require('./process');
const fs = require('fs');
const path = require('path');

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
        const { videoPath, audioPath } = await downloadVideo(url, outputDir);
        const { transcriptPath, srtPath } = await transcribeAudio(audioPath, outputDir);
        const transcript = fs.readFileSync(transcriptPath, 'utf8');
        const viralSegments = await analyzeTranscript(transcript, geminiApiKey);
        
        const shorts = [];
        for (let i = 0; i < viralSegments.length; i++) {
            const segment = viralSegments[i];
            const clipPath = await processClip(videoPath, srtPath, segment.start_time, segment.end_time, outputDir, i + 1);
            shorts.push({
                url: clipPath,
                duration: `${segment.start_time} - ${segment.end_time}`,
                title: segment.title,
                viral_score: segment.viral_score
            });
        }
        
        const result = { jobId, status: 'completed', shorts };
        fs.writeFileSync(path.join(outputDir, 'result.json'), JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Job failed:', error);
        const failureResult = { jobId, status: 'failed', error: error.message };
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, 'result.json'), JSON.stringify(failureResult, null, 2));
        process.exit(1);
    }
}

main();
