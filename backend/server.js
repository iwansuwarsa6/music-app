const express = require('express');
const cors = require('cors');
const play = require('play-dl'); // Kita pakai harta karun lu

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] PLAY-DL MENGHAJAR YOUTUBE ID: ${videoId}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        // Ambil data mentah langsung dari YouTube tanpa butuh OS/Binary
        const info = await play.video_info(url);
        
        // Filter khusus file yang cuma ada suaranya (audio only)
        const audioFormats = info.format.filter(f => f.hasAudio && !f.hasVideo);
        
        // Ambil kualitas suara yang paling jernih
        const bestAudio = audioFormats.sort((a, b) => b.audioBitrate - a.audioBitrate)[0];

        if (bestAudio && bestAudio.url) {
            console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
            res.redirect(bestAudio.url);
        } else {
            throw new Error('Gagal menemukan format audio');
        }
    } catch (error) {
        console.error('❌ PLAY-DL Gagal:', error.message);
        res.status(500).send('Gagal menembus API YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER PLAY-DL JALAN DI PORT ${PORT} 🔥`);
});