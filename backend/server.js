const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING lagu ID: ${videoId}...`);
    res.setHeader('Content-Type', 'audio/webm');

    // Kita panggil langsung 'yt-dlp' saja (tanpa path lengkap)
    // Biar sistem yang nyari di PATH (lokasi nixpacks)
    const ytDlpPath = 'yt-dlp'; 
    
    const args = [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
        '-o', '-'
    ];

    const stream = spawn(ytDlpPath, args);

    stream.stdout.pipe(res);

    stream.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
    });

    req.on('close', () => {
        stream.kill();
    });

    stream.on('error', (err) => {
        console.error('PROSES GAGAL (PATH MUNGKIN SALAH):', err.message);
        if (!res.headersSent) res.status(500).send('Gagal streaming: yt-dlp tidak ditemukan');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});