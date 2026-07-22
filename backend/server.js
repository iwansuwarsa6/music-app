const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic Aktif & Anti Badai (yt-dlp native) 🔥');
});

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID lagu kosong Bang!');

    console.log(`[ ▶ ] SEDOT LAGU (YT-DLP): ${videoId}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Kasih tau browser ini file media yang bisa di-play langsung
    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Panggil senjata nuklir yt-dlp langsung dari OS
    const ytDlp = spawn('yt-dlp', [
        '-f', 'bestaudio', // Ambil kualitas audio paling bagus
        '-o', '-',         // Lempar outputnya ke stdout (buat dikirim ke frontend)
        url
    ]);

    // Alirkan langsung ke frontend lu
    ytDlp.stdout.pipe(res);

    // Biar kita bisa liat di log Railway kalau yt-dlp lagi kerja
    ytDlp.stderr.on('data', (data) => {
        console.log(`[YT-DLP] ${data.toString().trim()}`);
    });

    ytDlp.on('close', (code) => {
        if (code === 0) {
            console.log(`[ ✔ ] BERHASIL MUTAR: ${videoId}`);
        } else {
            console.error(`[ ❌ ] GAGAL MUTAR: ${videoId} (Error code: ${code})`);
            if (!res.headersSent) res.status(500).send('Gagal disedot yt-dlp');
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER YT-DLP JALAN DI PORT ${PORT} 🔥`);
});