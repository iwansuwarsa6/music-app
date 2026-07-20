const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] INVIDIOUS MENGHAJAR YOUTUBE ID: ${videoId}`);

    // Kita sediain 3 server cadangan. Mati satu, otomatis ganti yang lain!
    const instances = [
        'https://invidious.jing.rocks',
        'https://inv.tux.pizza',
        'https://invidious.nerdvpn.de'
    ];

    let audioUrl = null;

    for (const instance of instances) {
        try {
            console.log(`Mencoba jalur tikus: ${instance}...`);
            const response = await fetch(`${instance}/api/v1/videos/${videoId}`);
            
            // Kalau server ini error/mati, langsung skip ke server berikutnya
            if (!response.ok) {
                console.log(`❌ ${instance} gagal, mencari jalan lain...`);
                continue; 
            }

            const data = await response.json();

            // Cari daftar stream khusus audio
            if (data.adaptiveFormats) {
                const audioFormats = data.adaptiveFormats.filter(f => f.type && f.type.includes('audio'));
                if (audioFormats.length > 0) {
                    // Sortir dari kualitas/bitrate yang paling tinggi
                    const bestAudio = audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
                    audioUrl = bestAudio.url;
                    
                    console.log(`✅ BERHASIL TEMBUS LEWAT: ${instance}`);
                    break; // Berhenti nyari kalau udah dapet linknya
                }
            }
        } catch (err) {
            console.log(`❌ ${instance} down/timeout, lanjut ke server cadangan...`);
        }
    }

    if (audioUrl) {
        console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
        res.redirect(audioUrl);
    } else {
        console.error('❌ SEMUA JALUR INVIDIOUS TUMBANG');
        res.status(500).send('Gagal menembus semua server cadangan');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER INVIDIOUS JALAN DI PORT ${PORT} 🔥`);
});