const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic (Jalur Cobalt YouTube) 🔥');
});

// Endpoint buat muter audio dari YouTube
app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID YouTube kosong Bang!');

    try {
        console.log(`[ ▶ ] Nyuruh Cobalt nembus YouTube ID: ${videoId}`);
        
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Nembak ke API Cobalt pakai metode POST
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: youtubeUrl,
            isAudioOnly: true, // Minta suaranya doang
            aFormat: "mp3"     // Format MP3 biar aman di semua browser
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Nyamar jadi browser asli
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        if (response.data && response.data.url) {
            console.log(`[ ✔ ] Sukses ditembus Cobalt! Ngarahin ke MP3...`);
            // Jangan didownload sama Railway! Langsung suruh HP/Laptop lu muter link dari Cobalt
            res.redirect(response.data.url);
        } else {
            return res.status(500).send('Cobalt gagal ngasih link.');
        }

    } catch (err) {
        console.error(`[ ❌ ] Gagal muter:`, err.message);
        res.status(500).send('Cobalt lagi sibuk atau diblokir.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER COBALT JALAN DI PORT ${PORT} 🔥`);
});