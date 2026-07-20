const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] YT-DLP MENGHAJAR YOUTUBE ID: ${videoId}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        // Eksekusi binary yt-dlp secara langsung ke server YouTube
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            youtubeSkipDashManifest: true,
            format: 'bestaudio'
        });

        if (output && output.url) {
            console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
            // Redirect langsung ke server internal Google/YouTube
            res.redirect(output.url);
        } else {
            throw new Error('URL kosong dari yt-dlp');
        }
    } catch (error) {
        console.error('❌ YT-DLP Gagal:', error.message);
        res.status(500).send('Gagal menembus API YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER YT-DLP JALAN DI PORT ${PORT} 🔥`);
});