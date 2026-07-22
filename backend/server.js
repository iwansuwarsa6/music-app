const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/', (req, res) => res.send('🔥 Backend RnCmusic (Piped Bypass) 🔥'));

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong!');

    try {
        console.log(`[ ▶ ] MINTA BANTUAN SERVER BAWAH TANAH: ${videoId}`);
        
        // Kita pakai API Piped (mereka yang ngurusin blokiran YouTube)
        let apiUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;
        
        let response;
        try {
            response = await axios.get(apiUrl);
        } catch (e) {
            console.log('Server utama sibuk, pindah ke server cadangan...');
            // Fallback kalau server utama down
            apiUrl = `https://pipedapi.syncpundit.io/streams/${videoId}`;
            response = await axios.get(apiUrl);
        }
        
        // Cari format audio
        const audio = response.data.audioStreams.find(s => 
            s.mimeType.startsWith('audio/mp4') || s.mimeType.startsWith('audio/webm')
        );
        
        if (!audio || !audio.url) {
            return res.status(500).send('Audio gagal ditarik dari Piped.');
        }

        console.log(`[ ✔ ] TEMBUS! Mengalirkan musik ke web lu...`);

        // Alirkan langsung ke frontend lu
        const stream = await axios({
            url: audio.url,
            method: 'GET',
            responseType: 'stream'
        });

        res.setHeader('Content-Type', 'audio/mp4');
        stream.data.pipe(res);

    } catch (err) {
        console.error(`[ ❌ ] GAGAL TOTAL:`, err.message);
        res.status(500).send('Server bawah tanah lagi down.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🔥 SERVER BYPASS JALAN DI PORT ${PORT} 🔥`));