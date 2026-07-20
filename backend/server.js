const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] OPERASI COBALT V10 FINAL ID: ${videoId}`);

    const cobaltServers = [
        'https://api.cobalt.tools',           
        'https://cobalt-api.kwiatekm.dev',    
        'https://cobalt.qwyzex.net',          
        'https://co.eepy.today'               
    ];

    let finalUrl = null;

    for (const server of cobaltServers) {
        try {
            console.log(`Mengetuk pintu: ${server}...`);
            
            const response = await fetch(server, { 
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    // INI KUNCI UTAMANYA: Pakai downloadMode, BUKAN isAudioOnly
                    downloadMode: 'audio', 
                    audioFormat: 'mp3'
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
        console.log('✅ LINK AUDIO DIDAPATKAN! Mengalihkan...');
        res.redirect(finalUrl);
    } else {
        console.error('❌ SEMUA SERVER COBALT TUMBANG ATAU NOLAK');
        res.status(500).send('Gagal menembus pertahanan YouTube');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER COBALT FINAL JALAN DI PORT ${PORT} 🔥`);
});