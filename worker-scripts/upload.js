const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const youtube = google.youtube('v3');

async function uploadToYouTube(videoPath, title, description, tags = []) {
    console.log(`📤 Uploading to YouTube: ${title}`);

    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/api/auth/callback/google'
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    try {
        const response = await youtube.videos.insert({
            auth: oauth2Client,
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: title.substring(0, 100),
                    description,
                    tags,
                    categoryId: '22', // People & Blogs
                    defaultLanguage: 'en',
                    defaultAudioLanguage: 'en'
                },
                status: {
                    privacyStatus: 'public', // Set to public as per user request
                    selfDeclaredMadeForKids: false
                }
            },
            media: {
                body: fs.createReadStream(videoPath)
            }
        });

        console.log(`✅ Upload successful! Video ID: ${response.data.id}`);
        return response.data;
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        throw error;
    }
}

module.exports = { uploadToYouTube };
