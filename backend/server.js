const express = require('express');
const cors = require('cors');
const { Innertube, UniversalCache } = require('youtubei.js');

const app = express();
app.use(cors());

// Panasin mesin youtubei.js
let yt;
Innertube.create({ cache: new UniversalCache(false) }).then((instance) => {
    yt = instance;
    console.log("🔥 MESIN YOUTUBEI.JS SIAP TEMPUR! 🔥");
}).catch(console.error);

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic Aktif (Nyamar jadi Android) 🔥');
});

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong Bang!');
    
    if (!yt) return res.status(503).send('Mesin lagi dipanasin, coba refresh bentar lagi.');

    try {
        console.log(`[ ▶ ] SEDOT LAGU: ${videoId}`);
        
        // 🔥 JURUS NYAMAR JADI HP ANDROID 🔥
        const stream = await yt.download(videoId, {
            type: 'audio',
            quality: 'best', 
            format: 'mp4',
            client: 'ANDROID' // <--- INI KUNCI BUKA GEMBOKNYA
        });

        res.setHeader('Content-Type', 'audio/mp4');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Alirkan data sepotong-sepotong ke frontend lu
        for await (const chunk of stream) {
            res.write(chunk);
        }
        res.end();
        console.log(`[ ✔ ] BERHASIL MUTAR: ${videoId}`);

    } catch (err) {
        console.error(`[ ❌ ] GAGAL: ${err.message}`);
        res.status(500).send('Gagal disedot youtubei');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER YOUTUBEI JALAN DI PORT ${PORT} 🔥`);
});