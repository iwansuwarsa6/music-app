const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/', (req, res) => res.send('🔥 Backend RnCmusic (Nyamar Chrome & Redirect) 🔥'));

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong!');

    try {
        console.log(`[ ▶ ] MENCARI LINK BAWAH TANAH: ${videoId}`);
        
        // 🔥 JURUS LICIK: Nyamar jadi Google Chrome versi terbaru biar lolos Cloudflare
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8'
        };
        
        // Daftar server komunitas (kalau satu mati, otomatis nyoba yang lain)
        const apis = [
            `https://pipedapi.kavin.rocks/streams/${videoId}`,
            `https://pipedapi.syncpundit.io/streams/${videoId}`,
            `https://de.piped.api.nosebs.ru/streams/${videoId}`
        ];

        let data = null;
        
        for (let url of apis) {
            try {
                console.log(`Mencoba nembus: ${url}`);
                const response = await axios.get(url, { headers });
                if (response.data && response.data.audioStreams) {
                    data = response.data;
                    break; // Kalau tembus 1, langsung stop nyari
                }
            } catch (e) {
                console.log(`[ ! ] Gagal nembus, lanjut cari jalan lain...`);
            }
        }

        if (!data) {
            return res.status(500).send('Semua jalur bawah tanah diblokir.');
        }
        
        // Cari format audio yang support di web
        const audio = data.audioStreams.find(s => 
            s.mimeType.startsWith('audio/mp4') || s.mimeType.startsWith('audio/webm')
        );
        
        if (!audio || !audio.url) {
            return res.status(500).send('Audio tidak ditemukan.');
        }

        console.log(`[ ✔ ] LINK DAPET! Mengalihkan player ke jalur langsung...`);

        // 🔥 STRATEGI BARU: Jangan didownload sama server Railway!
        // Langsung suruh web lu (Frontend) muter lagunya dari link aslinya.
        res.redirect(audio.url);

    } catch (err) {
        console.error(`[ ❌ ] ERROR FATAL:`, err.message);
        res.status(500).send('Server error.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🔥 SERVER REDIRECT JALAN DI PORT ${PORT} 🔥`));