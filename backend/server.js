const express = require('express');
const cors = require('cors');
const play = require('play-dl'); // Kita pake keajaiban ini sekarang

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING lagu ID: ${videoId} pakai play-dl...`);

    try {
        // Ambil stream murni pakai Javascript, BYPASS yt-dlp dan OS
        const stream = await play.stream(`https://www.youtube.com/watch?v=${videoId}`);
        
        // Set header otomatis dari play-dl
        res.setHeader('Content-Type', stream.type || 'audio/webm');
        
        // Alirkan langsung ke frontend lu
        stream.stream.pipe(res);

        req.on('close', () => {
            if (!stream.stream.destroyed) {
                stream.stream.destroy();
            }
        });

    } catch (error) {
        console.error('PROSES GAGAL (PLAY-DL ERROR):', error.message);
        if (!res.headersSent) res.status(500).send('Gagal streaming lagu');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});