const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');

const app = express();
app.use(cors());

// 🔥 PORT DINAMIS BUAT RAILWAY (Wajib pake process.env.PORT) 🔥
const PORT = process.env.PORT || 5000;

// 🔥 ENDPOINT AUDIO REDIRECT (MENDUKUNG GESER/SEEK WAKTU) 🔥
app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] Mengambil link asli lagu ID: ${videoId}...`);

    try {
        // Ambil URL file asli langsung dari server YouTube
        const url = await ytDlp(`https://www.youtube.com/watch?v=${videoId}`, {
            getUrl: true,
            format: 'bestaudio'
        });

        // Redirect langsung ke server YouTube
        res.redirect(url.trim());
    } catch (error) {
        console.error("Gagal dapat URL:", error.message);
        res.status(500).send("Error fetching audio");
    }
});

app.get('/api/download', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID lagu kosong');
    try {
        const url = await ytDlp(`https://www.youtube.com/watch?v=${videoId}`, { 
            getUrl: true, 
            format: 'bestaudio' 
        });
        res.redirect(url.trim());
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Gagal download');
    }
});

app.listen(PORT, () => {
    console.log(`🔥 SERVER STREAMING VVIP JALAN DI PORT ${PORT} 🔥`);
});