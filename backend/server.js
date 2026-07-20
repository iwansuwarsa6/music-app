const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core'); // Pakai senjata andalan

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] STREAMING lagu ID: ${videoId} pakai ytdl-core...`);

    try {
        // Cek dulu apakah YouTube nerima URL ini
        if (!ytdl.validateURL(url)) {
            console.error('URL Ditolak sama ytdl-core');
            return res.status(400).send('URL tidak valid');
        }

        res.setHeader('Content-Type', 'audio/webm');

        // Tarik stream audionya
        const stream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio' // Cari kualitas paling waras
        });

        // Alirkan ke frontend
        stream.pipe(res);

        // Kalau tiba-tiba putus di tengah jalan
        stream.on('error', (err) => {
            console.error('PROSES GAGAL (YTDL-CORE ERROR):', err.message);
            if (!res.headersSent) res.status(500).send('Gagal streaming lagu');
        });

        // Kalau user tutup browser/ganti lagu, matiin streamnya biar ga boros memory server
        req.on('close', () => {
            stream.destroy();
        });

    } catch (error) {
        console.error('PROSES GAGAL (SISTEM):', error.message);
        if (!res.headersSent) res.status(500).send('Terjadi kesalahan internal');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});