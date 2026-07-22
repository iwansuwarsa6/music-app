const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('🔥 Backend RnCmusic (Jalur JioSaavn) - BEBAS BLOKIR 🔥');
});

// 1. Endpoint buat nyari lagu (Frontend lu nembak ke sini buat dapet ID lagu)
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).send('Mau nyari lagu apa Bang?');

    try {
        console.log(`[ 🔍 ] Nyari lagu: ${query}`);
        // Nembak ke server komunitas JioSaavn (Gratis, gak perlu Key)
        const response = await axios.get(`https://saavn.dev/api/search/songs?query=${query}`);
        
        // Kirim data lagunya ke frontend lu
        res.json(response.data);
    } catch (err) {
        console.error(`[ ❌ ] Gagal nyari:`, err.message);
        res.status(500).send('Server pencarian lagi gangguan.');
    }
});

// 2. Endpoint buat muter audio berdasarkan ID lagu
app.get('/api/audio', async (req, res) => {
    const songId = req.query.id;
    if (!songId) return res.status(400).send('ID lagu kosong!');

    try {
        console.log(`[ ▶ ] Ngambil audio ID: ${songId}`);
        
        // Minta detail lagunya ke API
        const response = await axios.get(`https://saavn.dev/api/songs/${songId}`);
        const songData = response.data.data[0];

        if (!songData || !songData.downloadUrl) {
            return res.status(404).send('Audio gak ketemu Bang.');
        }

        // Cari link audio kualitas paling bagus (320kbps) atau seadanya
        const audioLink = songData.downloadUrl.find(q => q.quality === '320kbps')?.link || songData.downloadUrl[0].link;

        console.log(`[ ✔ ] Audio dapet! Langsung disetelin...`);
        
        // Redirect langsung ke link MP4/M4A aslinya (Biar server lu gak capek nyedot)
        res.redirect(audioLink);

    } catch (err) {
        console.error(`[ ❌ ] Gagal muter:`, err.message);
        res.status(500).send('Gagal narik audio dari JioSaavn.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🔥 SERVER JIOSAAVN JALAN DI PORT ${PORT} 🔥`);
});