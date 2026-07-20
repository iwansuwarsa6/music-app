const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] MINTA LINK RAHASIA KE PIPED API: ${videoId}`);

    // Kita pakai server Piped API (Jauh lebih stabil dan tahan banting)
    const apiUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;

    https.get(apiUrl, (apiRes) => {
        let data = '';
        
        apiRes.on('data', chunk => data += chunk);
        
        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                
                if (json.error) {
                    console.error('❌ Piped Error:', json.error);
                    return res.status(500).send('Video diblokir atau tidak ditemukan');
                }

                if (!json.audioStreams || json.audioStreams.length === 0) {
                    console.error('❌ Stream audio kosong dari Piped');
                    return res.status(500).send('Audio tidak tersedia');
                }

                // Ambil audio kualitas terbaik dari Piped
                const bestAudio = json.audioStreams[0];
                console.log('✅ DAPET LINKNYA! Langsung di-lempar ke Vercel (Redirect)...');
                
                // TRIK DEWA: Langsung alihkan frontend lu ke URL audio aslinya!
                // Player di Vercel lu bakal otomatis muter link ini tanpa mikir.
                res.redirect(bestAudio.url);

            } catch (e) {
                console.error('❌ Gagal baca API Piped:', e.message);
                if (!res.headersSent) res.status(500).send('Gagal parsing data');
            }
        });
    }).on('error', (err) => {
        console.error('❌ Server Piped API mati:', err.message);
        if (!res.headersSent) res.status(500).send('Server bypass down');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER CHEAT JALAN DI PORT ${PORT} 🔥`);
});