const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Pasukan Server Cadangan. Kalau satu mati/kena Cloudflare, otomatis ganti yang lain!
const PIPED_INSTANCES = [
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.syncpundit.io',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.kavin.rocks'
];

async function cariLaguNgotot(videoId, indexServer = 0) {
    if (indexServer >= PIPED_INSTANCES.length) {
        throw new Error('Semua server cadangan mati atau diblokir.');
    }

    const baseUrl = PIPED_INSTANCES[indexServer];
    const apiUrl = `${baseUrl}/streams/${videoId}`;
    console.log(`[▶️] Mencoba tembus lewat server: ${baseUrl}...`);

    return new Promise((resolve, reject) => {
        https.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Kalau dapet HTML (Kena Cloudflare/Error), langsung pindah server!
                if (data.trim().startsWith('<')) {
                    console.log(`[⚠️] Server ${baseUrl} kena Cloudflare. Ganti target...`);
                    return resolve(cariLaguNgotot(videoId, indexServer + 1));
                }

                try {
                    const json = JSON.parse(data);
                    if (json.error || !json.audioStreams || json.audioStreams.length === 0) {
                        console.log(`[⚠️] Server ${baseUrl} kosong. Ganti target...`);
                        return resolve(cariLaguNgotot(videoId, indexServer + 1));
                    }
                    
                    // Sukses dapet URL lagunya!
                    resolve(json.audioStreams[0].url);
                } catch (e) {
                    console.log(`[⚠️] Server ${baseUrl} error JSON. Ganti target...`);
                    resolve(cariLaguNgotot(videoId, indexServer + 1));
                }
            });
        }).on('error', () => {
            console.log(`[⚠️] Server ${baseUrl} Down. Ganti target...`);
            resolve(cariLaguNgotot(videoId, indexServer + 1));
        });
    });
}

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    try {
        const audioUrl = await cariLaguNgotot(videoId);
        console.log('✅ DAPET LINK RAHASIANYA! Mengalihkan Vercel ke lagu asli...');
        
        // Trik langsung lempar ke Vercel lu
        res.redirect(audioUrl);
    } catch (error) {
        console.error('❌ GAGAL TOTAL:', error.message);
        res.status(500).send('Mohon maaf, semua jalur sedang down.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER ANTI-BADAI JALAN DI PORT ${PORT} 🔥`);
});