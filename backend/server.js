const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] MENCARI JALUR BYPASS UNTUK ID: ${videoId}`);

    // Pintu Belakang: Pakai API Invidious publik biar IP Railway gak disentuh YouTube
    const apiUrl = `https://vid.puffyan.us/api/v1/videos/${videoId}`;

    https.get(apiUrl, (apiRes) => {
        let data = '';
        
        apiRes.on('data', chunk => data += chunk);
        
        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                
                if (json.error) {
                    console.error('❌ Invidious Error:', json.error);
                    return res.status(500).send('Video diblokir atau tidak ditemukan');
                }

                // Cari link audio murni dari hasil bypass
                const audioFormat = json.adaptiveFormats.find(f => f.type.includes('audio'));
                
                if (!audioFormat || !audioFormat.url) {
                    console.error('❌ Format audio tidak ketemu di jalur bypass');
                    return res.status(500).send('Gagal mengekstrak audio');
                }

                console.log('✅ JALUR BYPASS TEMBUS! Mengalirkan audio ke Vercel lu...');
                
                // Sedot URL audio rahasianya dan lempar langsung ke web lu
                https.get(audioFormat.url, (audioRes) => {
                    res.setHeader('Content-Type', 'audio/webm');
                    audioRes.pipe(res);
                }).on('error', (err) => {
                    console.error('❌ Gagal menyedot stream bypass:', err.message);
                    if (!res.headersSent) res.status(500).send('Stream terputus');
                });

            } catch (e) {
                console.error('❌ Gagal membaca jalur bypass:', e.message);
                if (!res.headersSent) res.status(500).send('Gagal parsing data');
            }
        });
    }).on('error', (err) => {
        console.error('❌ Server bypass mati:', err.message);
        if (!res.headersSent) res.status(500).send('Server bypass down');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER BYPASS JALAN DI PORT ${PORT} 🔥`);
});