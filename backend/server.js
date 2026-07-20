const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec'); // Kita pake package yang udah lu install dari awal!

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] STREAMING lagu ID: ${videoId} pakai yt-dlp-exec...`);

    res.setHeader('Content-Type', 'audio/webm');

    // yt-dlp-exec bakal ngejalanin binary-nya sendiri tanpa error ENOENT
    const ytDlpProcess = ytdlp.exec(url, {
        f: 'bestaudio',
        o: '-' // Lempar outputnya sebagai stream
    }, {
        stdio: ['ignore', 'pipe', 'ignore']
    });

    // Alirkan langsung ke frontend lu
    ytDlpProcess.stdout.pipe(res);

    req.on('close', () => {
        if (ytDlpProcess) ytDlpProcess.kill();
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});