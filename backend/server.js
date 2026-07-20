const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] NIXPACKS MENGHAJAR YOUTUBE ID: ${videoId}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Jalankan perintah yt-dlp secara native di OS Railway
    // -f bestaudio = ambil audio terbaik
    // -g = get url (hanya ambil link, jangan didownload)
    const command = `yt-dlp -f bestaudio -g "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ YT-DLP Gagal:', error.message);
            return res.status(500).send('Gagal menembus API YouTube');
        }

        // stdout berisi link mentah dari YouTube
        const directUrl = stdout.trim();
        
        if (directUrl) {
            console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
            res.redirect(directUrl);
        } else {
            res.status(500).send('URL kosong');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER NATIVE JALAN DI PORT ${PORT} 🔥`);
});