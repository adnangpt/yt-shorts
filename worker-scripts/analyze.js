const fs = require('fs');

async function analyzeTranscript(transcript, apiKey) {
    console.log('Analyzing transcript for viral moments...');
    const prompt = `
You are a professional viral short-form video editor.
Analyze the transcript and identify the top 3 most engaging segments that would work well as standalone short videos.

This content could be from any source: podcasts, news, documentaries, educational videos, comedy, interviews, or any other format.
The transcript may be in any language (English, Hindi, Punjabi, etc.).

Focus on identifying:
- **High-impact moments**: Emotional peaks, surprising revelations, or powerful statements
- **Complete thoughts**: Segments that tell a complete mini-story or idea
- **Viral potential**: Controversial opinions, funny moments, motivational insights, or dramatic payoffs
- **Question-Answer loops** (if applicable): Start with context/question, end with the complete answer
- **Standalone value**: Each clip should make sense without needing the full video

Clip Rules:
- **STRICT MAXIMUM**: 60 seconds
- **Minimum**: 15 seconds
- **Optimal**: 30-45 seconds
- Prioritize the "payoff" (punchline, answer, insight, climax) over long setup
- If context is too long, trim the beginning but keep the segment understandable
- Each clip must feel complete and satisfying

Transcript:
${transcript}

Return STRICT JSON ONLY.
Format:
[
  {
    "start_time": "HH:MM:SS",
    "end_time": "HH:MM:SS",
    "viral_score": 0-100,
    "title": "Catchy hook title",
    "reason": "Why this segment is viral-worthy"
  }
]
Return exactly 3 segments, ranked by viral_score.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

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
    
    // Robust error handling for Gemini API response
    if (!data.candidates || data.candidates.length === 0) {
        console.error('Gemini API response:', JSON.stringify(data, null, 2));
        throw new Error('Gemini API returned no candidates. The content may have been blocked or the model is unavailable.');
    }
    
    if (!data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
        console.error('Gemini API response:', JSON.stringify(data, null, 2));
        throw new Error('Gemini API returned malformed response. Check if content was blocked.');
    }
    
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
