const express = require('express');
const cors = require('cors');
const { Innertube, UniversalCache } = require('youtubei.js');

const app = express();
app.use(cors());

let yt;
Innertube.create({ cache: new UniversalCache(false) }).then((instance) => {
    yt = instance;
    console.log("🔥 MESIN YOUTUBEI.JS SIAP TEMPUR! 🔥");
}).catch(console.error);

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic Aktif 🔥');
});

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong!');
    
    if (!yt) return res.status(503).send('Mesin belum siap.');

    try {
        console.log(`[ ▶ ] SEDOT LAGU: ${videoId}`);
        
        // Panggil versi YTMUSIC
        const stream = await yt.download(videoId, {
            type: 'audio',
            quality: 'best', 
            format: 'mp4',
            client: 'YTMUSIC' 
        });

        res.setHeader('Content-Type', 'audio/mp4');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of stream) {
            res.write(chunk);
        }
        res.end();
        console.log(`[ ✔ ] BERHASIL MUTAR: ${videoId}`);

    } catch (err) {
        console.error(`[ ❌ ] GAGAL: ${err.message}`);
        res.status(500).send('Gagal mecahin kode YouTube');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});