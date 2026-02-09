# Windows Setup Script for YouTube Shorts Automation
# Run this in PowerShell as Administrator

Write-Host "🚀 Setting up YouTube Shorts Automation on Windows..." -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Please run this script as Administrator (Right-click -> Run as Administrator)" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
Write-Host "`n📦 Checking Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "`n🐍 Checking Python..." -ForegroundColor Green
try {
    $pythonVersion = python --version
    Write-Host "✅ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Install FFmpeg
Write-Host "`n🎬 Installing FFmpeg..." -ForegroundColor Green
try {
    $ffmpegVersion = ffmpeg -version 2>$null
    Write-Host "✅ FFmpeg already installed" -ForegroundColor Green
} catch {
    Write-Host "Installing FFmpeg via winget..." -ForegroundColor Yellow
    winget install Gyan.FFmpeg
    Write-Host "✅ FFmpeg installed. Please restart PowerShell and run this script again." -ForegroundColor Green
    exit 0
}

# Install yt-dlp
Write-Host "`n📥 Installing yt-dlp..." -ForegroundColor Green
python -m pip install -U yt-dlp

# Install OpenAI Whisper
Write-Host "`n🎙️ Installing OpenAI Whisper..." -ForegroundColor Green
python -m pip install -U openai-whisper

# Check for NVIDIA GPU and install CUDA-enabled PyTorch
Write-Host "`n🎮 Checking for NVIDIA GPU..." -ForegroundColor Green
try {
    $gpu = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }
    if ($gpu) {
        Write-Host "✅ NVIDIA GPU detected: $($gpu.Name)" -ForegroundColor Green
        Write-Host "Installing CUDA-enabled PyTorch for GPU acceleration..." -ForegroundColor Yellow
        python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
        Write-Host "✅ GPU acceleration enabled! Whisper will be 10-20x faster! 🚀" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No NVIDIA GPU detected. Whisper will run on CPU (slower)." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not detect GPU. Installing CPU-only PyTorch..." -ForegroundColor Yellow
}

# Install Node.js dependencies
Write-Host "`n📦 Installing Node.js dependencies..." -ForegroundColor Green
npm install

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n💡 Usage:" -ForegroundColor Cyan
Write-Host "1. Set your API key:" -ForegroundColor White
Write-Host '   $env:GEMINI_API_KEY="your_api_key_here"' -ForegroundColor Yellow
Write-Host "`n2. Run the worker:" -ForegroundColor White
Write-Host '   node worker-scripts/main.js "YOUTUBE_URL" "job_name"' -ForegroundColor Yellow
Write-Host "`n3. Or start the web interface:" -ForegroundColor White
Write-Host '   npm run dev' -ForegroundColor Yellow
Write-Host '   Then open http://localhost:3000' -ForegroundColor Yellow
