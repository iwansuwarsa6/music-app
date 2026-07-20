const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] HACK VIDEO-AS-AUDIO YOUTUBE ID: ${videoId}`);

    const instances = [
        'https://invidious.jing.rocks',
        'https://inv.tux.pizza',
        'https://invidious.nerdvpn.de'
    ];

    let finalUrl = null;

    for (const instance of instances) {
        try {
            console.log(`Mencoba nembus lewat: ${instance}...`);
            const response = await fetch(`${instance}/api/v1/videos/${videoId}`);
            
            if (!response.ok) continue;

            const data = await response.json();

            // RAHASIA UTAMA: Kita ambil format Video MP4 standar, BUKAN audio-only.
            // formatStreams berisi video lengkap dengan suara yang jarang diblokir YouTube.
            if (data.formatStreams && data.formatStreams.length > 0) {
                // Ambil kualitas paling burik (360p) biar server/kuota nggak jebol
                const lowestQualityVideo = data.formatStreams.sort((a, b) => {
                    const resA = parseInt(a.resolution) || 999;
                    const resB = parseInt(b.resolution) || 999;
                    return resA - resB;
                })[0];
                
                finalUrl = lowestQualityVideo.url;
                console.log(`✅ BERHASIL DAPAT LINK (Format Video 360p) DARI: ${instance}`);
                break;
            }
        } catch (err) {
            console.log(`❌ ${instance} gagal, lanjut server lain...`);
        }
    }

    if (finalUrl) {
        console.log('✅ MENGALIHKAN KE PLAYER...');
        res.redirect(finalUrl);
    } else {
        console.error('❌ SEMUA JALUR TUMBANG');
        res.status(500).send('Gagal menembus API');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER HACK JALAN DI PORT ${PORT} 🔥`);
});