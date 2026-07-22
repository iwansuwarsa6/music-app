const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic (Cobalt API v10) 🔥');
});

// Endpoint buat muter audio dari YouTube
app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID YouTube kosong Bang!');

    try {
        console.log(`[ ▶ ] Nyuruh Cobalt v10 nembus YouTube ID: ${videoId}`);
        
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // 🔥 JURUS BARU: Format Cobalt API v10 🔥
        const response = await axios.post('https://api.cobalt.tools/', {
            url: youtubeUrl,
            downloadMode: "audio", // Format baru buat minta audionya aja
            audioFormat: "mp3",
            filenameStyle: "basic"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.data && response.data.url) {
            console.log(`[ ✔ ] Sukses ditembus Cobalt v10! Ngarahin ke MP3...`);
            // Langsung suruh HP/Laptop lu muter link dari Cobalt
            res.redirect(response.data.url);
        } else {
            return res.status(500).send('Cobalt gagal ngasih link.');
        }

    } catch (err) {
        // Tangkap detail error dari Cobalt biar ketahuan kalau mereka rewel lagi
        const errorMessage = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error(`[ ❌ ] Gagal muter: ${errorMessage}`);
        res.status(500).send('Gagal ditarik dari Cobalt.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER COBALT JALAN DI PORT ${PORT} 🔥`);
});