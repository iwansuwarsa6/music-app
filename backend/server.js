const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic Aktif & Gratis Seumur Hidup (No RapidAPI)! 🔥');
});

// ==========================================
// 1. ENDPOINT STREAMING AUDIO (Buat Muter Lagu di App)
// ==========================================
app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING GRATIS BYPASS YOUTUBE: ${videoId}`);

    try {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Ngatur Header biar frontend (React) ngebacanya sebagai MP3 murni
        res.header('Content-Type', 'audio/mpeg');
        
        // Jurus nyedot audio tanpa perantara
        ytdl(youtubeUrl, { 
            filter: 'audioonly', 
            quality: 'highestaudio' 
        }).pipe(res);

    } catch (error) {
        console.error('❌ Error nyedot audio:', error);
        res.status(500).send('Gagal memutar audio');
    }
});

// ==========================================
// 2. ENDPOINT DOWNLOAD MP3 (Buat Tombol Download)
// ==========================================
app.get('/api/download', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[⬇️] DOWNLOAD MP3 GRATIS: ${videoId}`);

    try {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Maksa browser HP/PC buat langsung ngebuka jendela Download
        res.header('Content-Disposition', `attachment; filename="RnCmusic-${videoId}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        
        ytdl(youtubeUrl, { 
            filter: 'audioonly', 
            quality: 'highestaudio' 
        }).pipe(res);

    } catch (error) {
        console.error('❌ Error download:', error);
        res.status(500).send('Gagal download audio');
    }
});

// Jalankan Server di Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER YTDL GRATIS JALAN DI PORT ${PORT} 🔥`);
});