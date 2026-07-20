const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process'); // Kita pake cara native

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING VVIP lagu ID: ${videoId}...`);
    res.setHeader('Content-Type', 'audio/webm');

    // Kita panggil langsung binary yt-dlp di sistem
    // railway (nixpacks) pasti nyimpen di /usr/bin/yt-dlp
    const ytDlpPath = '/usr/bin/yt-dlp';
    
    // Argumen untuk yt-dlp
    const args = [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
        '-o', '-'
    ];

    const stream = spawn(ytDlpPath, args);

    // Alirkan data
    stream.stdout.pipe(res);

    // Handle error dari sistem
    stream.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
    });

    // KUNCI: Matikan proses kalau user disconnect
    req.on('close', () => {
        console.log('User disconnect, killing stream process...');
        stream.kill();
    });

    stream.on('error', (err) => {
        console.error('Proses gagal:', err.message);
        if (!res.headersSent) res.status(500).send('Gagal streaming');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER STREAMING JALAN DI PORT ${PORT} 🔥`);
});