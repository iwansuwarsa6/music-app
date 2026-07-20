const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING lagu ID: ${videoId} pakai yt-dlp...`);
    res.setHeader('Content-Type', 'audio/webm');

    // Manggil yt-dlp murni bawaan sistem Railway (bukan file lokal)
    const ytDlpPath = 'yt-dlp'; 
    
    const args = [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
        '-o', '-'
    ];

    const stream = spawn(ytDlpPath, args);

    stream.stdout.pipe(res);

    // Nampilin log dari yt-dlp biar keliatan kalau dia lagi kerja/diblokir
    stream.stderr.on('data', (data) => {
        console.error(`yt-dlp log: ${data}`);
    });

    req.on('close', () => {
        stream.kill();
    });

    stream.on('error', (err) => {
        console.error('PROSES GAGAL:', err.message);
        if (!res.headersSent) res.status(500).send('Gagal memanggil yt-dlp');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});