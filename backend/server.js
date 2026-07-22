const express = require('express');
const cors = require('cors');
// Kita panggil yt-dlp dari dalam node_modules lu sendiri!
const ytDlp = require('yt-dlp-exec');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic Aktif (Pakai yt-dlp-exec) 🔥');
});

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID lagu kosong Bang!');

    console.log(`[ ▶ ] PROSES SEDOT: ${videoId}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Kasih tau browser ini stream media
    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Eksekusi yt-dlp bawaan node_modules
    const stream = ytDlp.exec(url, {
        format: 'bestaudio', // Ambil audio terbaik
        output: '-'          // Lempar langsung outputnya
    });

    // Alirkan datanya ke frontend
    stream.stdout.pipe(res);

    stream.on('error', (err) => {
        console.error(`[ ❌ ] GAGAL: ${err.message}`);
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER YT-DLP-EXEC JALAN DI PORT ${PORT} 🔥`);
});