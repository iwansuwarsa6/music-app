const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] OPERASI MULTI-COBALT YOUTUBE ID: ${videoId}`);

    // KUMPULAN SERVER COBALT TERBARU & AKTIF (Anti-Mati)
    const cobaltServers = [
        'https://api.cobalt.tools',           // Server Utama Resmi (Baru)
        'https://cobalt-api.kwiatekm.dev',    // Server Cadangan 1
        'https://cobalt.qwyzex.net',          // Server Cadangan 2
        'https://co.eepy.today'               // Server Cadangan 3
    ];

    let finalUrl = null;

    // Sistem loncat otomatis kalau ada server yang down
    for (const server of cobaltServers) {
        try {
            console.log(`Menembak via Cobalt: ${server}...`);
            const response = await fetch(`${server}/api/json`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    aFormat: 'mp3',
                    isAudioOnly: true
                })
            });

            if (!response.ok) {
                console.log(`❌ ${server} nolak, ganti senjata...`);
                continue;
            }

            const data = await response.json();

            if (data && data.url) {
                finalUrl = data.url;
                console.log(`✅ BERHASIL TEMBUS DI SERVER: ${server}`);
                break; // Langsung stop nyari kalau udah dapet linknya
            }
        } catch (err) {
            console.log(`❌ ${server} down/timeout, lanjut server berikutnya...`);
        }
    }

    if (finalUrl) {
        console.log('✅ LINK AUDIO DIDAPATKAN! Mengalihkan ke Vercel...');
        res.redirect(finalUrl);
    } else {
        console.error('❌ SEMUA SERVER COBALT TUMBANG');
        res.status(500).send('Gagal menembus pertahanan YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER MULTI-COBALT JALAN DI PORT ${PORT} 🔥`);
});