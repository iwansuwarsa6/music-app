const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] MINTA BANTUAN COBALT API BUAT YOUTUBE ID: ${videoId}`);

    try {
        // Kita tembak API publik Cobalt. Mereka yang bakal berdarah-darah nembus YouTube
        const response = await fetch('https://co.wuk.sh/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: youtubeUrl,
                isAudioOnly: true, // Minta audionya aja
                aFormat: 'mp3'     // Format paling aman
            })
        });

        const data = await response.json();

        // Kalau Cobalt berhasil, dia bakal ngasih URL direct-nya
        if (data && data.url) {
            console.log('✅ LINK AUDIO DARI COBALT DAPAT! Mengalihkan...');
            res.redirect(data.url);
        } else {
            console.error('Cobalt Error Response:', data);
            throw new Error('Cobalt gagal mengekstrak data');
        }
    } catch (error) {
        console.error('❌ COBALT Gagal:', error.message);
        res.status(500).send('Semua jalur API tumbang');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER COBALT JALAN DI PORT ${PORT} 🔥`);
});