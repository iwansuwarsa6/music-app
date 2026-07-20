const express = require('express');
const cors = require('cors');
const { Innertube, UniversalCache } = require('youtubei.js');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Variabel untuk nyimpen sistem Innertube
let yt;

// Panasin mesin youtubei.js pas server baru nyala
Innertube.create({ cache: new UniversalCache(false) })
    .then((instance) => {
        yt = instance;
        console.log('✅ MESIN YOUTUBEI.JS SIAP TEMPUR!');
    })
    .catch((err) => console.error('Gagal inisialisasi Youtubei:', err));

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] YOUTUBEI.JS MENGHAJAR YOUTUBE ID: ${videoId}`);

    if (!yt) return res.status(500).send('Sistem belum siap, tunggu sebentar...');

    try {
        // Ambil data langsung dari jantung YouTube
        const info = await yt.getBasicInfo(videoId);
        
        // Minta format audio terbaik
        const format = info.chooseFormat({ type: 'audio', quality: 'best' });

        if (format && format.url) {
            console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
            res.redirect(format.url);
        } else {
            throw new Error('Gagal mengekstrak format audio dari YouTubei');
        }
    } catch (error) {
        console.error('❌ YOUTUBEI Gagal:', error.message);
        res.status(500).send('Gagal menembus tameng YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER YOUTUBEI JALAN DI PORT ${PORT} 🔥`);
});