const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING VVIP lagu ID: ${videoId}...`);

    // Wajib set header biar web tau ini file audio
    res.setHeader('Content-Type', 'audio/webm');

    // Buka jalur yt-dlp langsung, tanpa disave ke file
    const stream = ytDlp.exec(`https://www.youtube.com/watch?v=${videoId}`, {
        format: 'bestaudio',
        output: '-' // Tanda strip '-' artinya langsung dialirin ke output
    });

    // Alirin suaranya dari server Railway LANGSUNG ke Vercel lu!
    stream.stdout.pipe(res);

    stream.on('error', (err) => {
        console.error('Ada error dari yt-dlp:', err.message);
    });
});

app.listen(PORT, () => {
    console.log(`🔥 SERVER STREAMING VVIP JALAN DI PORT ${PORT} 🔥`);
});