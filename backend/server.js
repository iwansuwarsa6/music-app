const express = require('express');
const cors = require('cors');
const play = require('play-dl');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic Aktif & Anti Razia (Play-DL) 🔥');
});

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID lagu kosong Bang!');

    try {
        console.log(`[ ▶ ] SEDOT LAGU (PLAY-DL): ${videoId}`);
        
        // Ambil stream langsung pake play-dl
        const stream = await play.stream(`https://www.youtube.com/watch?v=${videoId}`);
        
        // Kasih tau browser kalau ini file audio
        res.setHeader('Content-Type', 'audio/mpeg');
        
        // Kirim lagunya ke frontend lu
        stream.stream.pipe(res);
    } catch (error) {
        console.error('❌ GAGAL SEDOT:', error.message);
        res.status(500).send('Kena blokir YouTube / Gagal ngambil audio');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER PLAY-DL JALAN DI PORT ${PORT} 🔥`);
});