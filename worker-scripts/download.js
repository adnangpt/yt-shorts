const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function downloadVideo(url, outputDir) {
    console.log(`Downloading video from: ${url}`);
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const videoPath = path.join(outputDir, 'video.mp4');
    const audioPath = path.join(outputDir, 'audio.wav');

    try {
        console.log('Downloading video stream...');
        const cookiesPath = path.join(process.cwd(), 'cookies.txt');
        const hasCookies = fs.existsSync(cookiesPath);
        console.log(`Debug: cookies.txt exists: ${hasCookies}`);
        const cookiesArg = hasCookies ? `--cookies "${cookiesPath}"` : '';
        
        // Use web player client and more flexible format selection
        execSync(`yt-dlp ${cookiesArg} --extractor-args "youtube:player_client=web" -f "bv*[height<=720]+ba/b[height<=720]/bv*+ba/b" --merge-output-format mp4 "${url}" -o "${videoPath}"`, { stdio: 'inherit' });

        console.log('Extracting audio for transcription...');
        execSync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`, { stdio: 'inherit' });

        return { videoPath, audioPath };
    } catch (error) {
        console.error('Error downloading video:', error);
        throw error;
    }
}

if (require.main === module) {
    const url = process.argv[2];
    const outputDir = process.argv[3] || './temp';
    if (!url) {
        console.error('Usage: node download.js <url> [outputDir]');
        process.exit(1);
    }
    downloadVideo(url, outputDir);
}

module.exports = { downloadVideo };
