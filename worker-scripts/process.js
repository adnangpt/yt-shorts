const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function processClip(videoPath, srtPath, startTime, endTime, outputDir, index) {
    console.log(`Processing clip ${index}: ${startTime} - ${endTime}`);
    const outputPath = path.join(outputDir, `short_${index}.mp4`);
    const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    const filterComplex = [
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:10[bg]`,
        `[0:v]scale=1080:-1[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2[v]`
    ].join(';');

    try {
        const command = `ffmpeg -ss ${startTime} -to ${endTime} -i "${videoPath}" -filter_complex "${filterComplex}" -map "[v]" -map 0:a -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -y "${outputPath}"`;
        execSync(command, { stdio: 'inherit' });
        return outputPath;
    } catch (error) {
        console.error(`Error processing clip ${index}:`, error);
        throw error;
    }
}

if (require.main === module) {
    const videoPath = process.argv[2];
    const srtPath = process.argv[3];
    const startTime = process.argv[4];
    const endTime = process.argv[5];
    const outputDir = process.argv[6] || './temp';
    const index = process.argv[7] || '1';
    if (!videoPath || !srtPath || !startTime || !endTime) {
        console.error('Usage: node process.js <videoPath> <srtPath> <startTime> <endTime> [outputDir] [index]');
        process.exit(1);
    }
    processClip(videoPath, srtPath, startTime, endTime, outputDir, index);
}

module.exports = { processClip };
