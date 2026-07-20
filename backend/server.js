const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Pasukan Server Cobalt Versi Baru (V10+)
const COBALT_INSTANCES = [
    'https://api.cobalt.tools',
    'https://co.wuk.sh',
    'https://cobalt.kwi.li'
];

async function gedorCobaltBaru(videoId, index = 0) {
    if (index >= COBALT_INSTANCES.length) {
        throw new Error('Semua pintu server Cobalt tertutup.');
    }

    const baseUrl = COBALT_INSTANCES[index];
    console.log(`[▶️] Ngetuk pintu Cobalt versi baru di: ${baseUrl}...`);

    try {
        // API baru Cobalt nembaknya langsung ke root '/'
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: `https://www.youtube.com/watch?v=${videoId}`,
                downloadMode: 'audio', // Parameter sakti versi baru
                audioFormat: 'mp3'     // Paksa jadi MP3
            })
        });

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const data = await response.json();

        // Kalau Cobalt ngeluh error, kita tangkep pesannya
        if (data.status === 'error') {
            console.log(`[⚠️] ${baseUrl} nolak:`, data.text);
            return gedorCobaltBaru(videoId, index + 1);
        }

        if (data.url) return data.url;

        throw new Error('URL audio kosong dari Cobalt');
    } catch (error) {
        console.log(`[⚠️] ${baseUrl} gagal:`, error.message);
        return gedorCobaltBaru(videoId, index + 1);
    }
}

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    try {
        const audioUrl = await gedorCobaltBaru(videoId);
        console.log('✅ JALUR BARU TEMBUS! Redirect Vercel ke lagu asli...');
        res.redirect(audioUrl);
    } catch (error) {
        console.error('❌ GAGAL TOTAL:', error.message);
        res.status(500).send('Mohon maaf, semua server bypass down.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER COBALT V10 JALAN DI PORT ${PORT} 🔥`);
});