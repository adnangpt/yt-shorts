# YouTube Shorts Automation Platform

Automatically convert long-form YouTube videos into viral short-form clips using AI analysis and video processing.

## ✨ Features

- 🎬 **Automatic Video Download**: Downloads YouTube videos using `yt-dlp`
- 🎙️ **AI Transcription**: Uses OpenAI Whisper for accurate multilingual transcription (English, Hindi, Urdu, Punjabi, Hinglish)
- 🤖 **Smart Clip Selection**: Gemini AI analyzes transcripts to find the most viral moments
- 🎨 **Professional Processing**: Creates vertical 9:16 shorts with blurred backgrounds
- 🌐 **Web Interface**: Next.js dashboard for easy job submission and tracking
- ⚡ **GPU Acceleration**: Supports NVIDIA GPUs for 10-20x faster transcription

## 🚀 Quick Start

### Windows (Gaming Laptop - Recommended)

1. **Clone the repository**:
   ```powershell
   git clone https://github.com/adnangpt/yt-shorts.git
   cd yt-shorts
   ```

2. **Run setup script** (as Administrator):
   ```powershell
   .\setup_windows.ps1
   ```

3. **Set your Gemini API key**:
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```

4. **Process a video**:
   ```powershell
   node worker-scripts/main.js "https://youtu.be/VIDEO_ID" "job_name"
   ```

### Linux/Ubuntu

1. **Clone the repository**:
   ```bash
   git clone https://github.com/adnangpt/yt-shorts.git
   cd yt-shorts
   ```

2. **Run setup script**:
   ```bash
   bash setup_local.sh
   ```

3. **Set your Gemini API key**:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

4. **Process a video**:
   ```bash
   node worker-scripts/main.js "https://youtu.be/VIDEO_ID" "job_name"
   ```

## 🌐 Web Interface

Start the Next.js development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The web interface currently triggers GitHub Actions. For local processing, use the command-line worker directly.

## 📋 Requirements

- **Node.js** 18+ 
- **Python** 3.8+
- **FFmpeg**
- **yt-dlp**
- **OpenAI Whisper**
- **Gemini API Key** (Get from [Google AI Studio](https://aistudio.google.com/))

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key
GITHUB_PAT=your_github_token (optional, for GitHub Actions)
GITHUB_OWNER=your_username
GITHUB_REPO=yt-shorts
```

### YouTube Cookies (Optional)

If you encounter YouTube bot detection:

1. Export cookies from your browser using a cookie extension
2. Save as `cookies.txt` in the project root
3. The tool will automatically use them

## 🎯 How It Works

1. **Download**: Uses `yt-dlp` to download the YouTube video
2. **Transcribe**: Extracts audio and transcribes with Whisper (medium model for multilingual support)
3. **Analyze**: Gemini AI analyzes the transcript to find viral moments (Q&A loops, emotional peaks, etc.)
4. **Process**: FFmpeg creates vertical shorts with:
   - 9:16 aspect ratio (1080x1920)
   - Blurred background
   - Centered video
   - No subtitles (add your own in CapCut)

## 🚀 Performance Tips

### GPU Acceleration (Windows/Linux with NVIDIA GPU)

The setup scripts automatically detect and configure GPU acceleration. With a gaming laptop GPU:
- **10-minute video**: ~1-2 minutes transcription (vs 15+ minutes on CPU)
- **Recommended**: RTX 3060 or better

### Model Selection

- **Medium model** (default): Best for multilingual content (Hindi, Urdu, Punjabi, Hinglish)
- **Base model**: Faster, good for English-only content
- **Large model**: Most accurate, but very slow

## 📁 Output Structure

```
temp/
└── job_name/
    ├── video.mp4          # Downloaded video
    ├── audio.wav          # Extracted audio
    ├── audio.txt          # Full transcript
    ├── audio.srt          # Subtitle file
    ├── result.json        # AI analysis results
    ├── short_1.mp4        # First viral clip
    ├── short_2.mp4        # Second viral clip
    └── short_3.mp4        # Third viral clip
```

## 🐛 Troubleshooting

### "yt-dlp/ffmpeg/whisper is not recognized"

**Windows**: Restart PowerShell after running `setup_windows.ps1`

**Linux**: Run `source ~/.bashrc` or restart your terminal

### YouTube Bot Detection

1. Export fresh cookies from your browser
2. Save as `cookies.txt` in project root
3. Re-run the worker

### Slow Transcription

- Use GPU acceleration (see setup scripts)
- Switch to `base` model for English-only content
- Process shorter videos (5-7 minutes)

## 📝 License

MIT

## 🙏 Credits

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloading
- [OpenAI Whisper](https://github.com/openai/whisper) - Transcription
- [Google Gemini](https://ai.google.dev/) - AI analysis
- [FFmpeg](https://ffmpeg.org/) - Video processing
