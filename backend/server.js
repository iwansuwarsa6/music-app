const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic (Invidious API) 🔥');
});

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID YouTube kosong!');

    try {
        console.log(`[ ▶ ] Nyari di server bayangan Invidious: ${videoId}`);
        
        // Daftar server bayangan Invidious yang aktif
        const instances = [
            'https://invidious.jing.rocks',
            'https://inv.tux.pizza',
            'https://invidious.flokinet.to',
            'https://vid.puffyan.us'
        ];

        let audioUrl = null;

        for (const url of instances) {
            try {
                console.log(`Mencoba ngetuk: ${url}`);
                const response = await axios.get(`${url}/api/v1/videos/${videoId}`, {
                    timeout: 6000 // Jeda 6 detik, kalau ngelag langsung ganti server
                });

                // Nyari format audio kualitas bagus
                const format = response.data.adaptiveFormats.find(f => f.type.includes('audio/mp4') || f.type.includes('audio/webm'));
                
                if (format && format.url) {
                    audioUrl = format.url;
                    console.log(`[ ✔ ] Berhasil dapet dari: ${url}`);
                    break;
                }
            } catch (e) {
                console.log(`[ ! ] Gagal/Server sibuk, pindah...`);
            }
        }

        if (!audioUrl) {
            return res.status(500).send('Semua server bayangan lagi down.');
        }

        // Redirect ke link asli biar Railway lu gak kena beban
        res.redirect(audioUrl);

    } catch (err) {
        console.error(`[ ❌ ] Error:`, err.message);
        res.status(500).send('Gagal total.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER INVIDIOUS JALAN DI PORT ${PORT} 🔥`);
});