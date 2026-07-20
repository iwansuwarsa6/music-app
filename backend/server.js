const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');

const app = express();
app.use(cors());

// Railway memaksa aplikasi dengerin di PORT yang dia kasih
const PORT = process.env.PORT || 3000;

// Path yt-dlp: Railway (nixpacks) pake /usr/bin/yt-dlp
// Kita deteksi apakah lagi di server Railway atau di laptop lu
const YTDLP_PATH = process.env.NODE_ENV === 'production' ? '/usr/bin/yt-dlp' : 'yt-dlp';

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING VVIP lagu ID: ${videoId}...`);

    // Set header agar browser tahu ini stream audio
    res.setHeader('Content-Type', 'audio/webm');

    // Menjalankan yt-dlp
    // Kita tambahkan opsi 'binary' biar dia gak nyasar ke node_modules lagi
    const stream = ytDlp.exec(`https://www.youtube.com/watch?v=${videoId}`, {
        format: 'bestaudio',
        output: '-', 
        quiet: true,
        binary: YTDLP_PATH, 
    });

    // Alirkan data ke response
    stream.stdout.pipe(res);

    // KUNCI: Matikan proses yt-dlp kalau user tutup web
    req.on('close', () => {
        console.log('User disconnect, killing stream process...');
        stream.kill();
    });

    stream.on('error', (err) => {
        console.error('yt-dlp error:', err.message);
        if (!res.headersSent) {
            res.status(500).send('Gagal streaming dari YouTube');
        }
    });
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER STREAMING VVIP JALAN DI PORT ${PORT} 🔥`);
    console.log(`Using yt-dlp at: ${YTDLP_PATH}`);
});