const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');

const app = express();
app.use(cors());

// Railway memaksa aplikasi dengerin di PORT yang dia kasih, 
// kalau gak ada, default ke 3000
const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING VVIP lagu ID: ${videoId}...`);

    // Set header agar browser tahu ini stream audio
    res.setHeader('Content-Type', 'audio/webm');

    // Menjalankan yt-dlp untuk streaming
    const stream = ytDlp.exec(`https://www.youtube.com/watch?v=${videoId}`, {
        format: 'bestaudio',
        output: '-', // Streaming ke stdout
        quiet: true, // Biar log gak penuh
    });

    // Alirkan data ke response
    stream.stdout.pipe(res);

    // KUNCI PENTING: Matikan proses yt-dlp kalau user tutup web/ganti lagu
    // Biar server gak penuh memori (zombie process)
    req.on('close', () => {
        console.log('User disconnect, killing stream process...');
        stream.kill();
    });

    stream.on('error', (err) => {
        console.error('yt-dlp error:', err.message);
        // Kalau belum terlanjur ngirim data, kirim error
        if (!res.headersSent) {
            res.status(500).send('Gagal streaming dari YouTube');
        }
    });
});

// KUNCI PENTING: '0.0.0.0' adalah alamat wajib biar Railway bisa ngerouting traffic
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER STREAMING VVIP JALAN DI PORT ${PORT} 🔥`);
});