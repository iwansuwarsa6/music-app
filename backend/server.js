const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] OPERASI COBALT MENYAMAR YOUTUBE ID: ${videoId}`);

    const cobaltServers = [
        'https://api.cobalt.tools',           
        'https://cobalt-api.kwiatekm.dev',    
        'https://cobalt.qwyzex.net',          
        'https://co.eepy.today'               
    ];

    let finalUrl = null;

    for (const server of cobaltServers) {
        try {
            console.log(`Nyamar jadi manusia pakai Chrome ke: ${server}...`);
            const response = await fetch(`${server}/api/json`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // RAHASIA BARU: Topeng User-Agent biar dikira manusia pakai PC
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Origin': 'https://cobalt.tools',
                    'Referer': 'https://cobalt.tools/'
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    aFormat: 'mp3',
                    isAudioOnly: true
                })
            });

            if (!response.ok) {
                console.log(`❌ ${server} nolak (HTTP ${response.status}), ganti senjata...`);
                continue;
            }

            const data = await response.json();

            if (data && data.url) {
                finalUrl = data.url;
                console.log(`✅ BERHASIL TEMBUS DI SERVER: ${server}`);
                break; 
            }
        } catch (err) {
            console.log(`❌ ${server} down/timeout, lanjut server berikutnya...`);
        }
    }

    if (finalUrl) {
        console.log('✅ LINK AUDIO DIDAPATKAN! Mengalihkan ke Vercel...');
        res.redirect(finalUrl);
    } else {
        console.error('❌ SEMUA SERVER COBALT TUMBANG ATAU NOLAK');
        res.status(500).send('Gagal menembus pertahanan YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER MULTI-COBALT JALAN DI PORT ${PORT} 🔥`);
});