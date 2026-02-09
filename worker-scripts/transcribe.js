const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function transcribeAudio(audioPath, outputDir) {
    console.log(`Transcribing audio: ${audioPath}`);
    const model = 'medium'; // Using medium model for better multilingual support (Hindi, Urdu, Punjabi, Hinglish)
    try {
        console.log(`Running Whisper (${model} model)...`);
        execSync(`whisper "${audioPath}" --model ${model} --output_dir "${outputDir}" --output_format all`, { stdio: 'inherit' });
        const baseName = path.basename(audioPath, path.extname(audioPath));
        const transcriptPath = path.join(outputDir, `${baseName}.txt`);
        const srtPath = path.join(outputDir, `${baseName}.srt`);
        return { transcriptPath, srtPath };
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

if (require.main === module) {
    const audioPath = process.argv[2];
    const outputDir = process.argv[3] || './temp';
    if (!audioPath) {
        console.error('Usage: node transcribe.js <audioPath> [outputDir]');
        process.exit(1);
    }
    transcribeAudio(audioPath, outputDir);
}

module.exports = { transcribeAudio };
