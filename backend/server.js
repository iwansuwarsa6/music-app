const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] JALUR TIKUS (PIPED) MENGHAJAR YOUTUBE ID: ${videoId}`);

    try {
        // Numpang nanya ke server Piped API biar IP Railway lu aman dari blokir YouTube
        const response = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Cari daftar stream yang khusus audio doang
        const audioStreams = data.audioStreams;
        if (audioStreams && audioStreams.length > 0) {
            // Urutin dan ambil bitrate (kualitas) paling tinggi
            const bestAudio = audioStreams.sort((a, b) => b.bitrate - a.bitrate)[0];
            
            console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
            res.redirect(bestAudio.url);
        } else {
            throw new Error('Link audio gagal diekstrak');
        }
    } catch (error) {
        console.error('❌ JALUR TIKUS Gagal:', error.message);
        res.status(500).send('Gagal menembus tameng YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALUR TIKUS JALAN DI PORT ${PORT} 🔥`);
});