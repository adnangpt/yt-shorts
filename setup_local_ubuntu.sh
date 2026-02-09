#!/bash/bin
# Setup script for local YouTube Shorts worker

echo "🔍 Checking local dependencies..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux detected. Installing dependencies via apt..."
    sudo apt update
    sudo apt install -y python3-pip ffmpeg
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 macOS detected. Installing dependencies via brew..."
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install it first: https://brew.sh/"
        exit 1
    fi
    brew install python ffmpeg
else
    echo "⚠️ Unknown OS. Please manually install: python3-pip, ffmpeg"
fi

echo "📦 Installing yt-dlp..."
pip install -U yt-dlp

echo "🎙️ Installing OpenAI Whisper..."
pip install -U openai-whisper

echo "✅ Setup complete! You can now run the worker locally."
echo "💡 Usage:"
echo "export GEMINI_API_KEY='your_key_here'"
echo "node worker-scripts/main.js 'YOUTUBE_URL' 'JOB_ID'"
