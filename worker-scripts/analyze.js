const fs = require('fs');

async function analyzeTranscript(transcript, apiKey) {
    console.log('Analyzing transcript for viral moments...');
    const prompt = `
You are a professional viral short form video editor.
Analyze transcript and select top viral segments.

Focus on:
- Emotional spikes
- Story payoff moments
- Controversial opinions
- Funny punchlines
- Motivational moments

Clip Rules:
- Minimum duration: 20 seconds
- Maximum duration: 60 seconds
- Prefer 30–45 seconds

Transcript:
${transcript}

Return STRICT JSON ONLY.
Format:
[
  {
    "start_time": "HH:MM:SS",
    "end_time": "HH:MM:SS",
    "viral_score": 0-100,
    "title": "Short hook title",
    "reason": "Why viral"
  }
]
Return top 3 segments.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
}

if (require.main === module) {
    const transcriptPath = process.argv[2];
    const apiKey = process.env.GEMINI_API_KEY;
    if (!transcriptPath || !apiKey) {
        console.error('Usage: GEMINI_API_KEY=xxx node analyze.js <transcriptPath>');
        process.exit(1);
    }
    const transcript = fs.readFileSync(transcriptPath, 'utf8');
    analyzeTranscript(transcript, apiKey).then(result => {
        console.log(JSON.stringify(result, null, 2));
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { analyzeTranscript };
